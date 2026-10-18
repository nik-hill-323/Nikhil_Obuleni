"""Render evals/bench.json + evals/drift.json into a single self-contained HTML page."""

from __future__ import annotations

import json
import os

TEMPLATE = os.path.join(os.path.dirname(__file__), "report_template.html")


def write_report(root: str) -> str:
    with open(os.path.join(root, "evals", "bench.json")) as f:
        bench = f.read()
    with open(os.path.join(root, "evals", "drift.json")) as f:
        drift = f.read()
    with open(TEMPLATE) as f:
        html = f.read()
    # Embedded as JS literals; json.loads round-trip guarantees valid JSON.
    html = html.replace("/*BENCH*/null", json.dumps(json.loads(bench), separators=(",", ":")))
    html = html.replace("/*DRIFT*/null", json.dumps(json.loads(drift), separators=(",", ":")))
    out = os.path.join(root, "reports", "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as f:
        f.write(html)
    return out
