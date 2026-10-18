"""Routing policies.

The main one, `BanditRouter`, is a cost-aware contextual bandit (LinUCB with
exponential forgetting). Per model it learns a linear estimate of answer reward
(1 good, 0 wrong, -1 fabricated) from prompt features, then picks the model
maximising

    expected_reward + exploration_bonus - lam * cost_per_1k_requests - mu * latency_seconds

Costs are not learned blindly: they come from the price sheet and a running
estimate of each model's output length, so changing a price takes effect at once.
Forgetting (`gamma` < 1) lets the router notice a provider that silently gets worse.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass, field

import numpy as np

from .backends import ModelSpec
from .features import DIM


@dataclass
class RouteRequest:
    tokens_in: int
    max_cost: float | None = None  # hard $ cap per request
    latency_slo_ms: float | None = None  # hard cap on expected latency


@dataclass
class Decision:
    model: str
    scores: dict[str, dict] = field(default_factory=dict)


class Policy:
    name = "policy"

    def choose(self, x: np.ndarray, req: RouteRequest) -> Decision:
        raise NotImplementedError

    def update(self, x: np.ndarray, model: str, quality: float | None, latency_ms: float, tokens_out: int) -> None:
        pass


class StaticPolicy(Policy):
    def __init__(self, model: str):
        self.model = model
        self.name = f"always-{model}"

    def choose(self, x, req):
        return Decision(self.model)


class RandomPolicy(Policy):
    name = "random"

    def __init__(self, models: list[str], seed: int = 0):
        self.models = models
        self.rng = random.Random(seed)

    def choose(self, x, req):
        return Decision(self.rng.choice(self.models))


class KeywordPolicy(Policy):
    """The hand-written if/else router most teams start with."""

    name = "keyword-rules"

    def __init__(self, cheap: str, code: str, strong: str):
        self.cheap, self.code, self.strong = cheap, code, strong

    def choose(self, x, req):
        from .features import HAND

        cue = dict(zip(HAND, x[: len(HAND)]))
        if cue["code"] > 0.3:
            return Decision(self.code)
        if cue["reason"] > 0.3 or cue["grounded"] > 0:
            return Decision(self.strong)
        return Decision(self.cheap)


class BanditRouter(Policy):
    name = "switchboard"

    def __init__(self, models: list[ModelSpec], lam: float = 0.05, mu: float = 0.02,
                 alpha: float = 0.1, gamma: float = 0.999, ridge: float = 1.0, version: str = "v0"):
        self.specs = {m.name: m for m in models}
        self.lam, self.mu, self.alpha, self.gamma, self.ridge = lam, mu, alpha, gamma, ridge
        self.version = version
        self.A = {m: ridge * np.eye(DIM) for m in self.specs}
        self.A_inv = {m: np.eye(DIM) / ridge for m in self.specs}
        self.b = {m: np.zeros(DIM) for m in self.specs}
        # Output length is mostly a property of the request, so it gets one shared
        # ridge regression plus a per-model verbosity ratio. Latency is the spec
        # sheet's (ttft + per-token) model times a per-model slowdown factor. Neither
        # estimate drifts just because a model starts receiving harder traffic.
        self.tok_A_inv = np.eye(DIM) / ridge
        self.tok_b = np.zeros(DIM)
        self.tok_ratio = {m: 1.0 for m in self.specs}
        self.slowdown = {m: 1.0 for m in self.specs}
        self.n = {m: 0 for m in self.specs}

    def predict(self, x: np.ndarray, model: str) -> float:
        """Expected reward: probability of a good answer, minus the fabrication penalty."""
        return float(np.clip((self.A_inv[model] @ self.b[model]) @ x, -1.0, 1.0))

    def forget(self, model: str, keep: float = 0.2) -> None:
        """Shrink what has been learned about one model so fresh evidence dominates.

        Called by the ops loop when a drift alarm fires for that model.
        """
        eye = self.ridge * np.eye(DIM)
        self.A[model] = eye + keep * (self.A[model] - eye)
        self.b[model] = keep * self.b[model]
        self.A_inv[model] = np.linalg.inv(self.A[model])

    def _base_tokens(self, x: np.ndarray) -> float:
        return max(5.0, float((self.tok_A_inv @ self.tok_b) @ x))

    def est_tokens_out(self, x: np.ndarray, model: str) -> float:
        return self._base_tokens(x) * self.tok_ratio[model]

    def est_latency(self, model: str, tokens_out: float) -> float:
        s = self.specs[model]
        return self.slowdown[model] * (s.latency_ms + s.ms_per_token * tokens_out)

    def choose(self, x, req):
        scores = {}
        for m in self.specs:
            q = self.predict(x, m)
            bonus = self.alpha * float(np.sqrt(max(x @ self.A_inv[m] @ x, 0.0)))
            t_out = self.est_tokens_out(x, m)
            cost = self.specs[m].cost(req.tokens_in, int(t_out))
            lat = self.est_latency(m, t_out)
            feasible = (req.max_cost is None or cost <= req.max_cost) and \
                       (req.latency_slo_ms is None or lat <= req.latency_slo_ms)
            score = q + bonus - self.lam * cost * 1000 - self.mu * lat / 1000
            scores[m] = dict(pred_reward=round(q, 3), bonus=round(bonus, 3), est_cost=cost,
                             est_latency_ms=round(lat), feasible=feasible, score=round(score, 4))
        pool = [m for m in scores if scores[m]["feasible"]]
        if not pool:  # nothing meets the constraints: degrade to the cheapest model
            return Decision(min(scores, key=lambda m: scores[m]["est_cost"]), scores)
        return Decision(max(pool, key=lambda m: scores[m]["score"]), scores)

    def update(self, x, model, quality, latency_ms, tokens_out):
        base = self._base_tokens(x)
        self.tok_ratio[model] = 0.95 * self.tok_ratio[model] + 0.05 * tokens_out / base
        s = self.specs[model]
        expected = s.latency_ms + s.ms_per_token * tokens_out
        self.slowdown[model] = 0.9 * self.slowdown[model] + 0.1 * latency_ms / expected
        Ax = self.tok_A_inv @ x  # Sherman-Morrison: no decay on the shared length model
        self.tok_A_inv -= np.outer(Ax, Ax) / (1 + x @ Ax)
        self.tok_b += tokens_out * x
        if quality is None:  # no label for this request; only the ops stats move
            return
        g = self.gamma
        if g == 1.0:  # no forgetting: a rank-1 Sherman-Morrison update is enough
            Ax = self.A_inv[model] @ x
            self.A_inv[model] -= np.outer(Ax, Ax) / (1 + x @ Ax)
            self.A[model] += np.outer(x, x)
        else:
            self.A[model] = g * self.A[model] + (1 - g) * self.ridge * np.eye(DIM) + np.outer(x, x)
            self.A_inv[model] = np.linalg.inv(self.A[model])
        self.b[model] = g * self.b[model] + quality * x
        self.n[model] += 1

    def frozen(self) -> "BanditRouter":
        """A copy that keeps routing but ignores all further feedback."""
        clone = BanditRouter.from_dict(self.to_dict())
        clone.update = lambda *a, **k: None  # type: ignore[method-assign]
        clone.name = "frozen-router"
        return clone

    def to_dict(self) -> dict:
        return dict(version=self.version, lam=self.lam, mu=self.mu, alpha=self.alpha, gamma=self.gamma,
                    ridge=self.ridge, specs=[s.__dict__ for s in self.specs.values()],
                    A={m: a.tolist() for m, a in self.A.items()}, b={m: v.tolist() for m, v in self.b.items()},
                    tok_A_inv=self.tok_A_inv.tolist(), tok_b=self.tok_b.tolist(), tok_ratio=self.tok_ratio,
                    slowdown=self.slowdown, n=self.n)

    @classmethod
    def from_dict(cls, d: dict) -> "BanditRouter":
        r = cls([ModelSpec(**s) for s in d["specs"]], d["lam"], d["mu"], d["alpha"], d["gamma"], d["ridge"], d["version"])
        r.A = {m: np.array(a) for m, a in d["A"].items()}
        r.A_inv = {m: np.linalg.inv(a) for m, a in r.A.items()}
        r.b = {m: np.array(v) for m, v in d["b"].items()}
        r.tok_A_inv, r.tok_b = np.array(d["tok_A_inv"]), np.array(d["tok_b"])
        r.tok_ratio, r.slowdown, r.n = dict(d["tok_ratio"]), dict(d["slowdown"]), dict(d["n"])
        return r

    def save(self, path: str) -> None:
        with open(path, "w") as f:
            json.dump(self.to_dict(), f)

    @classmethod
    def load(cls, path: str) -> "BanditRouter":
        with open(path) as f:
            return cls.from_dict(json.load(f))
