"""Graders. None of them call an LLM, so evals are cheap, deterministic and CI-safe.

- exact / numeric match for format, classify, extract, math, reasoning
- sandboxed unit-test execution for code
- a groundedness checker for answers that must stay inside a context passage;
  it needs only the answer and the context, so it also runs on live traffic
  where there is no reference answer.
"""

from __future__ import annotations

import hashlib
import os
import re
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from functools import lru_cache

from .dataset import Task

STOP = set("""a an the of in on at to for by with and or is are was were be been it its this that
these those as from also only answer one sentence context question reply which what who how
much many did does do per""".split())


# A wrong answer scores 0; an answer that invents facts scores -1. Users can see a
# miss, but a confident fabrication gets acted on.
HALLUCINATION_PENALTY = 1.0


@dataclass
class Grade:
    correct: bool
    hallucinated: bool
    unsupported: list[str] = field(default_factory=list)

    @property
    def quality(self) -> float:
        """1.0 only for a correct answer with no fabricated claims."""
        return 1.0 if self.correct and not self.hallucinated else 0.0

    @property
    def reward(self) -> float:
        """What the router learns from. A fabricated claim costs more than a plain miss."""
        return -HALLUCINATION_PENALTY if self.hallucinated else self.quality


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().strip("`\"'").strip().rstrip(".")).lower()


def final_answer(text: str) -> str:
    m = re.search(r"answer(?: is)?\s*[:\s]\s*(.+)", text, flags=re.I)
    if m:
        return _norm(m.group(1))
    lines = [ln for ln in text.strip().splitlines() if ln.strip()]
    return _norm(lines[-1]) if lines else ""


def extract_code(text: str) -> str:
    m = re.search(r"```(?:python)?\n(.*?)```", text, flags=re.S)
    return m.group(1) if m else text


@lru_cache(maxsize=4096)
def run_tests(code: str, tests: str, timeout: float = 3.0) -> bool:
    """Run model-written code against asserts in an isolated interpreter."""
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "candidate.py")
        with open(path, "w") as f:
            f.write(code + "\n\n" + tests + "\n")
        try:
            r = subprocess.run([sys.executable, "-I", path], cwd=d, capture_output=True, timeout=timeout,
                               env={"PATH": os.environ.get("PATH", "")})
        except subprocess.TimeoutExpired:
            return False
        return r.returncode == 0


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]


def _stem(t: str) -> str:
    for suf in ("ing", "ed", "es", "s"):
        if len(t) > len(suf) + 2 and t.endswith(suf):
            return t[: -len(suf)]
    return t


def _tokens(s: str) -> list[str]:
    return [_stem(t) for t in re.findall(r"[a-z0-9]+", s.lower()) if t not in STOP]


def unsupported_claims(answer: str, context: str, question: str = "", min_support: float = 0.7) -> list[str]:
    """Sentences in `answer` that neither the context nor the question back up.

    A sentence is unsupported if any number in it is absent from the context, or if
    fewer than `min_support` of its content words appear in the context.
    """
    ctx = set(_tokens(context + " " + question))
    bad = []
    for sent in _sentences(answer):
        toks = _tokens(sent)
        if not toks:
            continue
        nums = [t for t in toks if t.isdigit()]
        support = sum(t in ctx for t in toks) / len(toks)
        if any(n not in ctx for n in nums) or support < min_support:
            bad.append(sent)
    return bad


def grade(task: Task, text: str) -> Grade:
    if task.category == "code":
        return Grade(run_tests(extract_code(text), task.tests or ""), False)
    if task.category == "rag_qa":
        unsupported = unsupported_claims(text, task.context or "", task.prompt)
        correct = _norm(task.reference) in _norm(text)
        return Grade(correct, bool(unsupported), unsupported)
    got, want = final_answer(text), _norm(task.reference)
    if task.category in ("math", "reasoning"):
        nums = re.findall(r"-?\d+(?:\.\d+)?", got)
        return Grade(bool(nums) and float(nums[-1]) == float(want), False)
    return Grade(got == want, False)


def fingerprint(text: str) -> str:
    return hashlib.sha1(text.encode()).hexdigest()[:12]
