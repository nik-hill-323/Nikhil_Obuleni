"""HTTP gateway: route, call the chosen model, check groundedness, trace, learn from feedback.

Standard library only. Endpoints:
  POST /v1/complete  {"prompt", "context"?, "max_cost"?, "latency_slo_ms"?}
  POST /v1/route     same body, returns the decision without calling a model
  POST /v1/feedback  {"trace_id", "quality": 0..1}
  GET  /metrics      Prometheus text format
  GET  /api/stats    JSON for the dashboard
  GET  /             live dashboard
"""

from __future__ import annotations

import hashlib
import json
import os
import random
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np

from .backends import SimulatedBackend, est_tokens, make_backend
from .cli import ROOT, load_fleet
from .dataset import Task, generate
from .features import featurize
from .judge import HALLUCINATION_PENALTY, grade, unsupported_claims
from .ops import Monitor
from .router import BanditRouter, RouteRequest
from .tracing import TraceStore

DASHBOARD = os.path.join(os.path.dirname(__file__), "dashboard.html")


class Gateway:
    def __init__(self, fleet: str, lam: float):
        specs = load_fleet(fleet)
        self.backends = {s.name: make_backend(s) for s in specs}
        path = os.path.join(ROOT, "artifacts", "router.json")
        if os.path.exists(path) and {s.name for s in specs} == set(BanditRouter.load(path).specs):
            self.router = BanditRouter.load(path)
        else:  # cold start on spec-sheet priors; it learns from /v1/feedback
            self.router = BanditRouter(specs, lam=lam)
        self.traces = TraceStore(os.path.join(ROOT, "artifacts", "traces.db"))
        self.monitor = Monitor(list(self.backends))
        self.lock = threading.Lock()

    def decide(self, body: dict):
        x = featurize(body["prompt"], body.get("context"))
        req = RouteRequest(est_tokens(body["prompt"] + (body.get("context") or "")),
                           body.get("max_cost"), body.get("latency_slo_ms"))
        with self.lock:
            return x, self.router.choose(x, req)

    def complete(self, body: dict, task: Task | None = None) -> dict:
        x, d = self.decide(body)
        backend = self.backends[d.model]
        if task is None:
            task = Task("live", "unknown", body["prompt"], "", 0.5, ["(no answer)"], context=body.get("context"))
        if isinstance(backend, SimulatedBackend) and task.id == "live":
            r = backend.generate(task)
            r.text = f"[simulated fleet: routed to {d.model}; set --fleet configs/fleet.claude.json for real answers]"
        else:
            r = backend.generate(task)
        unsupported = unsupported_claims(r.text, task.context, task.prompt) if task.context else []
        tid = self.traces.log(router_version=self.router.version, model=d.model,
                              prompt_sha=hashlib.sha1(body["prompt"].encode()).hexdigest()[:12],
                              tokens_in=r.tokens_in, tokens_out=r.tokens_out, cost=r.cost, latency_ms=r.latency_ms,
                              hallucinated=bool(unsupported), features=x.round(5).tolist(), scores=d.scores)
        with self.lock:
            self.router.update(x, d.model, None, r.latency_ms, r.tokens_out)
            self.monitor.observe(int(time.time()), d.model, None, r.latency_ms)
        return dict(trace_id=tid, model=d.model, answer=r.text, cost=r.cost, latency_ms=round(r.latency_ms, 1),
                    unsupported_claims=unsupported, scores=d.scores)

    def feedback(self, tid: str, quality: float) -> bool:
        row = self.traces.feedback(tid, quality)
        if not row:
            return False
        x = np.array(row["features"])
        reward = -HALLUCINATION_PENALTY if row["hallucinated"] else quality
        with self.lock:
            residual = reward - self.router.predict(x, row["model"])
            if "quality_drop" in self.monitor.observe(int(time.time()), row["model"], residual, row["latency_ms"]):
                self.router.forget(row["model"])
            self.router.update(x, row["model"], reward, row["latency_ms"], row["tokens_out"])
        return True

    def metrics(self) -> str:
        s = self.traces.stats(window_s=10 ** 9)
        lines = ["# TYPE switchboard_requests_total counter", "# TYPE switchboard_cost_dollars_total counter",
                 "# TYPE switchboard_hallucinations_total counter", "# TYPE switchboard_quality gauge",
                 "# TYPE switchboard_latency_ms_avg gauge", "# TYPE switchboard_alerts_total counter"]
        for m, v in s["models"].items():
            lines += [f'switchboard_requests_total{{model="{m}"}} {v["requests"]}',
                      f'switchboard_cost_dollars_total{{model="{m}"}} {v["cost"]:.6f}',
                      f'switchboard_hallucinations_total{{model="{m}"}} {v["hallucinations"]}',
                      f'switchboard_latency_ms_avg{{model="{m}"}} {v["avg_latency_ms"]:.1f}']
            if v["quality"] is not None:
                lines.append(f'switchboard_quality{{model="{m}"}} {v["quality"]:.4f}')
        lines.append(f"switchboard_alerts_total {len(self.monitor.alerts)}")
        return "\n".join(lines) + "\n"

    def demo_traffic(self, rate_hz: float = 20.0, feedback_rate: float = 0.3) -> None:
        """Replay synthetic tasks through the gateway and grade a sample, like a labeling queue would."""
        rng = random.Random(0)
        for task in generate(100_000, seed=42):
            out = self.complete({"prompt": task.prompt, "context": task.context}, task=task)
            if rng.random() < feedback_rate:
                self.feedback(out["trace_id"], grade(task, out["answer"]).quality)
            time.sleep(1 / rate_hz)


def serve(fleet: str, port: int, demo: bool, lam: float) -> None:
    gw = Gateway(fleet, lam)

    class Handler(BaseHTTPRequestHandler):
        def _send(self, code: int, body, ctype="application/json"):
            data = body if isinstance(body, bytes) else (json.dumps(body) if ctype == "application/json" else body).encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if self.path == "/metrics":
                return self._send(200, gw.metrics(), "text/plain; version=0.0.4")
            if self.path == "/api/stats":
                s = gw.traces.stats(window_s=120)
                s.update(recent=gw.traces.recent(12), alerts=gw.monitor.alerts[-10:], router_version=gw.router.version,
                         slowdown=gw.router.slowdown)
                return self._send(200, s)
            if self.path in ("/", "/index.html"):
                with open(DASHBOARD, "rb") as f:
                    return self._send(200, f.read(), "text/html; charset=utf-8")
            self._send(404, {"error": f"no route for GET {self.path}"})

        def do_POST(self):
            try:
                body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
            except json.JSONDecodeError as e:
                return self._send(400, {"error": f"body is not valid JSON: {e}"})
            if self.path in ("/v1/complete", "/v1/route") and not body.get("prompt"):
                return self._send(400, {"error": "field 'prompt' is required"})
            if self.path == "/v1/complete":
                return self._send(200, gw.complete(body))
            if self.path == "/v1/route":
                _, d = gw.decide(body)
                return self._send(200, {"model": d.model, "scores": d.scores})
            if self.path == "/v1/feedback":
                q = body.get("quality")
                if not isinstance(q, (int, float)) or not 0 <= q <= 1:
                    return self._send(400, {"error": "field 'quality' must be a number from 0 to 1"})
                ok = gw.feedback(str(body.get("trace_id")), float(q))
                return self._send(200 if ok else 404, {"ok": ok} if ok else {"error": "unknown trace_id"})
            self._send(404, {"error": f"no route for POST {self.path}"})

        def log_message(self, *args):
            pass

    if demo:
        threading.Thread(target=gw.demo_traffic, daemon=True).start()
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"switchboard gateway on http://127.0.0.1:{port}  (dashboard at /, metrics at /metrics)")
    httpd.serve_forever()
