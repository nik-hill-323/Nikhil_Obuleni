"""Command line: bench, simulate, report, gate, route, serve."""

from __future__ import annotations

import argparse
import json
import os
import sys
import time

import numpy as np

from . import evals, ops
from .backends import ModelSpec, make_backend
from .dataset import generate
from .features import featurize
from .router import BanditRouter, KeywordPolicy, RandomPolicy, RouteRequest, StaticPolicy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_FLEET = os.path.join(ROOT, "configs", "fleet.sim.json")
OUT = os.path.join(ROOT, "evals")


def load_fleet(path: str) -> list[ModelSpec]:
    with open(path) as f:
        return [ModelSpec(**m) for m in json.load(f)["models"]]


def _write(path: str, obj) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(obj, f, indent=1)


def bench(fleet: str, n_train: int, n_test: int, lam: float, seed: int = 0, sweep: bool = True) -> dict:
    specs = load_fleet(fleet)
    backends = {s.name: make_backend(s, seed) for s in specs}
    train, test = generate(n_train, seed=seed + 1), generate(n_test, seed=seed + 2)
    matrix = evals.outcome_matrix(train + test, backends)
    router = evals.train_offline(BanditRouter(specs, lam=lam, alpha=0.0, version=f"lam{lam}"), train, matrix)
    names = [s.name for s in specs]
    cheapest, strongest = names[0], names[-1]
    code_model = "coder" if "coder" in names else strongest
    results = {
        "switchboard": evals.run_policy(router, test, matrix),
        "keyword-rules": evals.run_policy(KeywordPolicy(names[1] if len(names) > 1 else cheapest, code_model, strongest), test, matrix),
        "random": evals.run_policy(RandomPolicy(names, seed), test, matrix),
        "cascade": evals.run_cascade([n for n in names if n != "coder"], test, backends),
        "oracle": evals.run_oracle(test, matrix, specs),
    }
    for n in names:
        results[f"always-{n}"] = evals.run_policy(StaticPolicy(n), test, matrix)
    out = dict(
        config=dict(fleet=os.path.relpath(fleet, ROOT), n_train=n_train, n_test=n_test, lam=lam, seed=seed),
        policies={k: evals.summarize(v) for k, v in results.items()},
        pareto=evals.pareto_sweep(specs, train, test, matrix) if sweep else [],
        models=[dict(name=s.name, price_in=s.price_in, price_out=s.price_out) for s in specs],
    )
    os.makedirs(os.path.join(ROOT, "artifacts"), exist_ok=True)
    router.save(os.path.join(ROOT, "artifacts", "router.json"))
    return out


def simulate(fleet: str, n: int, lam: float, seed: int = 0, window: int = 200) -> dict:
    specs = load_fleet(fleet)
    backends = {s.name: make_backend(s, seed) for s in specs}
    train = generate(1500, seed=seed + 1)
    router = evals.train_offline(BanditRouter(specs, lam=lam, alpha=0.1), train, evals.outcome_matrix(train, backends))
    frozen = router.frozen()
    policies = [router, frozen, StaticPolicy(specs[-1].name)]
    out = ops.simulate(generate(n, seed=seed + 7), backends, policies, ops.default_incidents(n), seed=seed)
    series = {}
    for name, tl in out["timeline"].items():
        q = np.array([e["quality"] for e in tl])
        c = np.array([e["cost"] for e in tl]) * 1000
        lat = np.array([e["latency_ms"] for e in tl])
        idx = list(range(window, n + 1, 25))
        series[name] = dict(
            t=idx,
            quality=[round(float(q[i - window:i].mean()), 4) for i in idx],
            cost_per_1k=[round(float(c[i - window:i].mean()), 4) for i in idx],
            p95_ms=[round(float(np.percentile(lat[i - window:i], 95))) for i in idx],
            totals=dict(quality=round(float(q.mean()), 4), cost_per_1k=round(float(c.mean()), 4),
                        p95_ms=round(float(np.percentile(lat, 95)))),
        )
    prod = out["timeline"][router.name]
    share = {}
    for s in specs:
        hits = np.array([e["model"] == s.name for e in prod], dtype=float)
        share[s.name] = [round(float(hits[i - window:i].mean()), 3) for i in series[router.name]["t"]]
    return dict(config=dict(n=n, lam=lam, window=window, feedback_rate=0.3, probe_rate=0.05, latency_slo_ms=3000),
                series=series, share=share, alerts=out["alerts"], incidents=out["incidents"],
                probe_cost_per_1k=round(1000 * out["probe_cost"] / n, 4))


def gate(current: dict, baseline: dict, rules: dict) -> list[str]:
    """Return a list of failures; empty means the candidate router may ship."""
    cur, base = current["policies"]["switchboard"], baseline["policies"]["switchboard"]
    frontier = current["policies"][rules["reference_policy"]]
    fails = []
    if cur["quality"] < base["quality"] - rules["max_quality_drop"]:
        fails.append(f"quality {cur['quality']:.3f} fell more than {rules['max_quality_drop']} below baseline {base['quality']:.3f}")
    if cur["cost_per_1k"] > base["cost_per_1k"] * (1 + rules["max_cost_increase"]):
        fails.append(f"cost/1k ${cur['cost_per_1k']:.3f} is over {rules['max_cost_increase']:.0%} above baseline ${base['cost_per_1k']:.3f}")
    if cur["hallucination_rate"] > rules["max_hallucination_rate"]:
        fails.append(f"hallucination rate {cur['hallucination_rate']:.3f} exceeds {rules['max_hallucination_rate']}")
    if cur["quality"] < rules["min_quality_vs_reference"] * frontier["quality"]:
        fails.append(f"quality is below {rules['min_quality_vs_reference']:.0%} of {rules['reference_policy']}")
    return fails


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="switchboard", description=__doc__)
    ap.add_argument("--fleet", default=DEFAULT_FLEET)
    ap.add_argument("--lam", type=float, default=0.1, help="quality points traded per $1 per 1k requests")
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("bench", help="offline eval of every policy on held-out tasks")
    b.add_argument("--n-train", type=int, default=1500)
    b.add_argument("--n-test", type=int, default=1500)
    s = sub.add_parser("simulate", help="replay production traffic through three incidents")
    s.add_argument("--n", type=int, default=6000)
    sub.add_parser("report", help="bench + simulate, then write reports/index.html")
    g = sub.add_parser("gate", help="CI regression gate against evals/baseline.json")
    g.add_argument("--update-baseline", action="store_true")
    r = sub.add_parser("route", help="show the routing decision for one prompt")
    r.add_argument("prompt")
    r.add_argument("--context")
    r.add_argument("--router", default=os.path.join(ROOT, "artifacts", "router.json"))
    v = sub.add_parser("serve", help="HTTP gateway with live dashboard")
    v.add_argument("--port", type=int, default=8080)
    v.add_argument("--demo", action="store_true", help="replay synthetic traffic so the dashboard has data")
    a = ap.parse_args(argv)

    if a.cmd == "bench":
        t0 = time.time()
        res = bench(a.fleet, a.n_train, a.n_test, a.lam)
        _write(os.path.join(OUT, "bench.json"), res)
        _print_table(res["policies"])
        print(f"\n{time.time() - t0:.1f}s -> evals/bench.json, artifacts/router.json")
    elif a.cmd == "simulate":
        res = simulate(a.fleet, a.n, a.lam)
        _write(os.path.join(OUT, "drift.json"), res)
        for k, v in res["series"].items():
            print(f"{k:16s} {v['totals']}")
        print("alerts:", res["alerts"])
    elif a.cmd == "report":
        from .report import write_report

        _write(os.path.join(OUT, "bench.json"), bench(a.fleet, 1500, 1500, a.lam))
        _write(os.path.join(OUT, "drift.json"), simulate(a.fleet, 6000, a.lam))
        print("wrote", write_report(ROOT))
    elif a.cmd == "gate":
        with open(os.path.join(OUT, "gate.json")) as f:
            rules = json.load(f)
        cur = bench(a.fleet, rules["n_train"], rules["n_test"], a.lam, sweep=False)
        path = os.path.join(OUT, "baseline.json")
        if a.update_baseline or not os.path.exists(path):
            _write(path, cur)
            print("baseline written")
            return 0
        with open(path) as f:
            base = json.load(f)
        _print_table({k: cur["policies"][k] for k in ("switchboard", rules["reference_policy"])})
        fails = gate(cur, base, rules)
        for msg in fails:
            print("FAIL:", msg)
        print("gate:", "FAILED" if fails else "passed")
        return 1 if fails else 0
    elif a.cmd == "route":
        router = BanditRouter.load(a.router)
        from .backends import est_tokens

        d = router.choose(featurize(a.prompt, a.context), RouteRequest(est_tokens(a.prompt + (a.context or ""))))
        print(f"-> {d.model}\n")
        print(f"{'model':10s} {'reward':>7s} {'bonus':>6s} {'$/1k':>8s} {'est_ms':>7s} {'score':>7s}")
        for m, sc in sorted(d.scores.items(), key=lambda kv: -kv[1]["score"]):
            print(f"{m:10s} {sc['pred_reward']:7.3f} {sc['bonus']:6.3f} {sc['est_cost'] * 1000:8.4f} "
                  f"{sc['est_latency_ms']:7d} {sc['score']:7.3f}")
    elif a.cmd == "serve":
        from .server import serve

        serve(a.fleet, a.port, a.demo, a.lam)
    return 0


def _print_table(policies: dict) -> None:
    print(f"{'policy':18s} {'quality':>8s} {'halluc':>7s} {'$/1k req':>9s} {'p50 ms':>7s} {'p95 ms':>7s}")
    for k, v in policies.items():
        print(f"{k:18s} {v['quality']:8.3f} {v['hallucination_rate']:7.3f} {v['cost_per_1k']:9.4f} "
              f"{v['p50_ms']:7d} {v['p95_ms']:7d}")


if __name__ == "__main__":
    sys.exit(main())
