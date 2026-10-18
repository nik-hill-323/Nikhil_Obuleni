"""Production loop: online learning, drift detection, and a replay of incidents.

In production there is no reference answer for most requests. This loop models the
signals a team actually has:

- sparse labels: a `feedback_rate` fraction of requests get graded (human review,
  a downstream check, or an LLM judge on a sample);
- shadow probes: a small slice of requests is also sent to a randomly chosen
  other model (not returned to the user) to keep every model's health stats fresh,
  so a recovered provider gets traffic back.

Per-model Page-Hinkley detectors watch quality (for drops) and latency (for
spikes and recoveries). A quality alarm makes the router forget most of what it
knew about that model, so it re-learns from post-incident evidence within a few
dozen labels instead of a few thousand.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field

from .dataset import Task
from .evals import request_for
from .features import featurize
from .judge import grade
from .router import Policy


class PageHinkley:
    """Sequential change detector for a shift in the mean of a stream.

    direction=-1 alarms on a decrease (quality), +1 on an increase (latency).
    """

    def __init__(self, delta: float, threshold: float, direction: int = -1, warmup: int = 30):
        self.delta, self.threshold, self.dir, self.warmup = delta, threshold, direction, warmup
        self.reset()

    def reset(self) -> None:
        self.n, self.mean, self.cum, self.extreme = 0, 0.0, 0.0, 0.0

    def update(self, x: float) -> bool:
        x = self.dir * x
        self.n += 1
        self.mean += (x - self.mean) / self.n
        self.cum += x - self.mean - self.delta
        self.extreme = min(self.extreme, self.cum)
        if self.n > self.warmup and self.cum - self.extreme > self.threshold:
            self.reset()
            return True
        return False


@dataclass
class Monitor:
    """Per-model drift detectors.

    Quality is watched as a residual (observed minus the router's own prediction),
    so a model that simply receives harder traffic does not look like it degraded.
    Latency is watched in both directions so recoveries are reported too.
    """

    models: list[str]
    alerts: list[dict] = field(default_factory=list)

    def __post_init__(self):
        self.q = {m: PageHinkley(delta=0.05, threshold=7.0, direction=-1) for m in self.models}
        self.lat_up = {m: PageHinkley(delta=0.2, threshold=12.0, direction=+1) for m in self.models}
        self.lat_down = {m: PageHinkley(delta=0.2, threshold=12.0, direction=-1) for m in self.models}

    def observe(self, t: int, model: str, residual: float | None, latency_ms: float) -> list[str]:
        fired = []
        if residual is not None and self.q[model].update(residual):
            fired.append("quality_drop")
        if self.lat_up[model].update(latency_ms / 1000):
            fired.append("latency_spike")
        if self.lat_down[model].update(latency_ms / 1000):
            fired.append("latency_recovered")
        self.alerts += [dict(t=t, model=model, kind=k) for k in fired]
        return fired


@dataclass
class Incident:
    t: int
    label: str
    apply: callable


def simulate(stream: list[Task], backends: dict, policies: list[Policy], incidents: list[Incident],
             feedback_rate: float = 0.3, probe_rate: float = 0.05, latency_slo_ms: float = 3000,
             seed: int = 0) -> dict:
    """Serve `stream` with every policy side by side. `policies[0]` is the one in
    production: the monitor watches its traffic, its alarms trigger forgetting, and
    it alone receives shadow probes."""
    rng = random.Random(seed)
    names = list(backends)
    monitor = Monitor(names)
    pending = sorted(incidents, key=lambda i: i.t)
    timeline = {p.name: [] for p in policies}
    probe_cost = 0.0
    prod = policies[0]

    def observe(t, x, m, reward, latency_ms):
        if not hasattr(prod, "predict"):
            return
        residual = None if reward is None else reward - prod.predict(x, m)
        if "quality_drop" in monitor.observe(t, m, residual, latency_ms):
            prod.forget(m)

    for t, task in enumerate(stream):
        while pending and pending[0].t == t:
            pending.pop(0).apply(backends)
        x = featurize(task.prompt, task.context)
        req = request_for(task)
        req.latency_slo_ms = latency_slo_ms
        labeled = rng.random() < feedback_rate
        probe = rng.random() < probe_rate
        probe_model = rng.choice(names)
        for policy in policies:
            m = policy.choose(x, req).model
            r = backends[m].generate(task)
            g = grade(task, r.text)
            fb = g.reward if labeled else None
            if policy is prod:
                observe(t, x, m, fb, r.latency_ms)
            policy.update(x, m, fb, r.latency_ms, r.tokens_out)
            timeline[policy.name].append(dict(model=m, quality=g.quality, hallucinated=g.hallucinated,
                                              cost=r.cost, latency_ms=r.latency_ms))
        if probe and probe_model != timeline[prod.name][-1]["model"]:
            pr = backends[probe_model].generate(task, salt=f"probe{t}")
            pfb = grade(task, pr.text).reward if labeled else None
            observe(t, x, probe_model, pfb, pr.latency_ms)
            prod.update(x, probe_model, pfb, pr.latency_ms, pr.tokens_out)
            probe_cost += pr.cost
    return dict(timeline=timeline, alerts=monitor.alerts, probe_cost=probe_cost,
                incidents=[dict(t=i.t, label=i.label) for i in incidents])


def default_incidents(n: int) -> list[Incident]:
    """Three things that happen to real fleets, placed through the stream."""

    def coder_regresses(b):
        b["coder"].skill_shift["code"] = -0.6
        b["coder"].skill_shift["math"] = -0.4

    def frontier_brownout(b):
        b["frontier"].latency_mult = 4.0

    def frontier_recovers(b):
        b["frontier"].latency_mult = 1.0

    return [
        Incident(int(n * 0.30), "coder: silent quality regression", coder_regresses),
        Incident(int(n * 0.55), "frontier: 4x latency brownout", frontier_brownout),
        Incident(int(n * 0.78), "frontier: recovered", frontier_recovers),
    ]
