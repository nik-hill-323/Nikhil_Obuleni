"""Model backends.

`SimulatedBackend` stands in for a provider so the whole system — routing, evals,
drift detection — runs offline, deterministically, for free. Each simulated model
has a per-category skill, a price sheet, a latency profile and a hallucination
rate; it emits real text that the graders in `judge.py` then check, so the eval
pipeline is exercised end to end rather than reading a hidden "correct" flag.

`ClaudeBackend` is the real thing, used when a registry entry says
`"provider": "anthropic"`.
"""

from __future__ import annotations

import hashlib
import math
import random
import time
from dataclasses import dataclass, field

from .dataset import Task


@dataclass
class ModelSpec:
    name: str
    price_in: float  # $ per 1M input tokens
    price_out: float  # $ per 1M output tokens
    latency_ms: float  # time to first token
    ms_per_token: float
    skills: dict[str, float] = field(default_factory=dict)
    hallucination: float = 0.05
    provider: str = "sim"
    provider_model: str | None = None
    effort: str | None = None

    def cost(self, tokens_in: int, tokens_out: int) -> float:
        return (tokens_in * self.price_in + tokens_out * self.price_out) / 1e6


@dataclass
class Response:
    text: str
    tokens_in: int
    tokens_out: int
    latency_ms: float
    cost: float
    model: str


def est_tokens(text: str) -> int:
    return max(1, len(text) // 4)


def _sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


class SimulatedBackend:
    SHARPNESS = 9.0

    def __init__(self, spec: ModelSpec, seed: int = 0):
        self.spec = spec
        self.seed = seed
        self.skill_shift: dict[str, float] = {}  # injected regressions
        self.latency_mult = 1.0

    def p_correct(self, task: Task) -> float:
        skill = self.spec.skills.get(task.category, 0.3) + self.skill_shift.get(task.category, 0.0)
        return _sigmoid(self.SHARPNESS * (skill - task.difficulty))

    def _rng(self, task: Task, salt: str) -> random.Random:
        h = hashlib.sha1(f"{self.spec.name}|{task.id}|{self.seed}|{salt}".encode()).hexdigest()
        return random.Random(int(h[:16], 16))

    def generate(self, task: Task, salt: str = "") -> Response:
        rng = self._rng(task, salt)
        correct = rng.random() < self.p_correct(task)
        answer = task.reference if correct else rng.choice(task.distractors)
        if task.category == "code":
            text = answer
        elif task.category == "rag_qa":
            subject = task.prompt.split("Question: ", 1)[1].rstrip("?")
            text = f"Per the context, the answer to \"{subject}\" is {answer}."
            p_h = self.spec.hallucination * (0.5 + task.difficulty)
            if rng.random() < p_h and task.bait:
                text += " " + task.bait
        else:
            text = rng.choice(["{a}", "The answer is {a}.", "Answer: {a}"]).format(a=answer)
        t_in = est_tokens(task.prompt + (task.context or ""))
        t_out = est_tokens(text) + (rng.randint(20, 120) if task.category in ("reasoning", "math") else 0)
        lat = (self.spec.latency_ms + self.spec.ms_per_token * t_out) * rng.lognormvariate(0, 0.25)
        return Response(text, t_in, t_out, lat * self.latency_mult, self.spec.cost(t_in, t_out), self.spec.name)


class ClaudeBackend:
    """Calls the Claude Messages API through the official `anthropic` SDK."""

    def __init__(self, spec: ModelSpec):
        import anthropic  # optional dependency: pip install anthropic

        self.spec = spec
        self.client = anthropic.Anthropic()

    def generate(self, task: Task, salt: str = "") -> Response:
        user = task.prompt if not task.context else f"Context: {task.context}\n\n{task.prompt}"
        kwargs = dict(model=self.spec.provider_model, max_tokens=16000,
                      messages=[{"role": "user", "content": user}])
        if self.spec.effort:
            kwargs["output_config"] = {"effort": self.spec.effort}
        t0 = time.perf_counter()
        if self.spec.provider_model in ("claude-opus-5-5", "claude-sonnet-5-5"):
            # Server-side fallback re-runs a declined request on another model.
            msg = self.client.beta.messages.create(betas=["server-side-fallback-2026-07-01"],
                                                   fallbacks="default", **kwargs)
        else:
            msg = self.client.messages.create(**kwargs)
        lat = (time.perf_counter() - t0) * 1000
        if msg.stop_reason == "refusal":
            text = ""
        else:
            text = "".join(b.text for b in msg.content if b.type == "text")
        t_in, t_out = msg.usage.input_tokens, msg.usage.output_tokens
        return Response(text, t_in, t_out, lat, self.spec.cost(t_in, t_out), self.spec.name)


def make_backend(spec: ModelSpec, seed: int = 0):
    return ClaudeBackend(spec) if spec.provider == "anthropic" else SimulatedBackend(spec, seed)
