"""Offline eval harness: run every policy on the same held-out tasks and score them.

Each model answers each task exactly once (the outcome matrix), so every policy
is compared on identical outputs and differences come only from routing.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass

import numpy as np

from .backends import ModelSpec, Response, est_tokens
from .dataset import CATEGORIES, Task
from .features import featurize
from .judge import Grade, final_answer, grade
from .router import BanditRouter, Policy, RouteRequest


@dataclass
class Record:
    task_id: str
    category: str
    model: str  # model that produced the returned answer ("a>b" for a cascade path)
    quality: float
    hallucinated: bool
    cost: float
    latency_ms: float


Matrix = dict[tuple[str, str], tuple[Response, Grade]]


def outcome_matrix(tasks: list[Task], backends: dict) -> Matrix:
    out = {}
    for t in tasks:
        for name, be in backends.items():
            r = be.generate(t)
            out[(t.id, name)] = (r, grade(t, r.text))
    return out


def request_for(t: Task) -> RouteRequest:
    return RouteRequest(tokens_in=est_tokens(t.prompt + (t.context or "")))


def run_policy(policy: Policy, tasks: list[Task], matrix: Matrix, learn: bool = False) -> list[Record]:
    recs = []
    for t in tasks:
        x = featurize(t.prompt, t.context)
        m = policy.choose(x, request_for(t)).model
        r, g = matrix[(t.id, m)]
        if learn:
            policy.update(x, m, g.reward, r.latency_ms, r.tokens_out)
        recs.append(Record(t.id, t.category, m, g.quality, g.hallucinated, r.cost, r.latency_ms))
    return recs


def run_cascade(tiers: list[str], tasks: list[Task], backends: dict) -> list[Record]:
    """FrugalGPT-style cascade: sample a tier twice; accept if the samples agree, else escalate.

    Pays for every call it makes, and latencies add up along the path.
    """
    recs = []
    for t in tasks:
        cost = lat = 0.0
        path = []
        for i, name in enumerate(tiers):
            a = backends[name].generate(t)
            cost, lat = cost + a.cost, lat + a.latency_ms
            path.append(name)
            if i == len(tiers) - 1:
                final = a
                break
            b = backends[name].generate(t, salt="resample")
            cost, lat = cost + b.cost, lat + b.latency_ms
            if final_answer(a.text) == final_answer(b.text):
                final = a
                break
        g = grade(t, final.text)
        recs.append(Record(t.id, t.category, ">".join(path), g.quality, g.hallucinated, cost, lat))
    return recs


def run_oracle(tasks: list[Task], matrix: Matrix, models: list[ModelSpec]) -> list[Record]:
    """Cheapest model that got it right, in hindsight. An upper bound no router can reach."""
    by_price = sorted(models, key=lambda s: s.price_out)
    recs = []
    for t in tasks:
        pick = next((s.name for s in by_price if matrix[(t.id, s.name)][1].quality == 1.0), by_price[-1].name)
        r, g = matrix[(t.id, pick)]
        recs.append(Record(t.id, t.category, pick, g.quality, g.hallucinated, r.cost, r.latency_ms))
    return recs


def train_offline(router: BanditRouter, tasks: list[Task], matrix: Matrix, epochs: int = 2) -> BanditRouter:
    """Full-information training: offline we know every model's grade on every task.

    Forgetting is switched off here; it only makes sense for a live stream.
    """
    gamma, router.gamma = router.gamma, 1.0
    for _ in range(epochs):
        for t in tasks:
            x = featurize(t.prompt, t.context)
            for m in router.specs:
                r, g = matrix[(t.id, m)]
                router.update(x, m, g.reward, r.latency_ms, r.tokens_out)
    router.gamma = gamma
    return router


def summarize(recs: list[Record]) -> dict:
    n = len(recs)
    lat = np.array([r.latency_ms for r in recs])
    by_cat = defaultdict(list)
    for r in recs:
        by_cat[r.category].append(r.quality)
    share = Counter(r.model for r in recs)
    rag = [r for r in recs if r.category == "rag_qa"]
    return dict(
        n=n,
        quality=round(float(np.mean([r.quality for r in recs])), 4),
        hallucination_rate=round(sum(r.hallucinated for r in rag) / max(1, len(rag)), 4),
        cost_per_1k=round(1000 * sum(r.cost for r in recs) / n, 4),
        p50_ms=round(float(np.percentile(lat, 50))),
        p95_ms=round(float(np.percentile(lat, 95))),
        by_category={c: round(float(np.mean(by_cat[c])), 3) for c in CATEGORIES if by_cat[c]},
        share={m: round(k / n, 3) for m, k in share.most_common()},
    )


def pareto_sweep(specs: list[ModelSpec], train: list[Task], test: list[Task], matrix: Matrix,
                 lams=(0.0, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0)) -> list[dict]:
    points = []
    for lam in lams:
        r = train_offline(BanditRouter(specs, lam=lam, alpha=0.0), train, matrix)
        s = summarize(run_policy(r, test, matrix))
        points.append(dict(lam=lam, quality=s["quality"], cost_per_1k=s["cost_per_1k"], p95_ms=s["p95_ms"]))
    return points
