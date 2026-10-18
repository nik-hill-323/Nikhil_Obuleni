"""Request traces in SQLite: one row per routed request, joined later with feedback."""

from __future__ import annotations

import json
import sqlite3
import threading
import time
import uuid

SCHEMA = """
CREATE TABLE IF NOT EXISTS traces (
  id TEXT PRIMARY KEY,
  ts REAL NOT NULL,
  router_version TEXT,
  model TEXT NOT NULL,
  prompt_sha TEXT,
  tokens_in INTEGER, tokens_out INTEGER,
  cost REAL, latency_ms REAL,
  hallucinated INTEGER,
  quality REAL,            -- NULL until feedback arrives
  features TEXT,           -- JSON, so feedback can update the router later
  scores TEXT              -- JSON, the router's per-model scores at decision time
);
CREATE INDEX IF NOT EXISTS traces_ts ON traces(ts);
"""


class TraceStore:
    def __init__(self, path: str = ":memory:"):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.executescript(SCHEMA)
        self.lock = threading.Lock()

    def log(self, *, router_version: str, model: str, prompt_sha: str, tokens_in: int, tokens_out: int,
            cost: float, latency_ms: float, hallucinated: bool, features: list[float], scores: dict) -> str:
        tid = uuid.uuid4().hex[:16]
        with self.lock:
            self.db.execute("INSERT INTO traces VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            (tid, time.time(), router_version, model, prompt_sha, tokens_in, tokens_out, cost,
                             latency_ms, int(hallucinated), None, json.dumps(features), json.dumps(scores)))
            self.db.commit()
        return tid

    def feedback(self, tid: str, quality: float) -> dict | None:
        with self.lock:
            row = self.db.execute("SELECT model, features, latency_ms, tokens_out, hallucinated FROM traces WHERE id=?", (tid,)).fetchone()
            if not row:
                return None
            self.db.execute("UPDATE traces SET quality=? WHERE id=?", (quality, tid))
            self.db.commit()
        return dict(model=row[0], features=json.loads(row[1]), latency_ms=row[2], tokens_out=row[3], hallucinated=bool(row[4]))

    def recent(self, limit: int = 20) -> list[dict]:
        with self.lock:
            rows = self.db.execute("SELECT id, ts, model, cost, latency_ms, hallucinated, quality FROM traces "
                                   "ORDER BY ts DESC LIMIT ?", (limit,)).fetchall()
        keys = ["id", "ts", "model", "cost", "latency_ms", "hallucinated", "quality"]
        return [dict(zip(keys, r)) for r in rows]

    def stats(self, window_s: float = 300) -> dict:
        since = time.time() - window_s
        with self.lock:
            per_model = self.db.execute(
                "SELECT model, COUNT(*), SUM(cost), AVG(latency_ms), SUM(hallucinated), AVG(quality), COUNT(quality) "
                "FROM traces WHERE ts > ? GROUP BY model", (since,)).fetchall()
            lats = [r[0] for r in self.db.execute("SELECT latency_ms FROM traces WHERE ts > ? ORDER BY latency_ms", (since,))]
            total = self.db.execute("SELECT COUNT(*), COALESCE(SUM(cost),0) FROM traces").fetchone()
        p95 = lats[int(0.95 * (len(lats) - 1))] if lats else 0.0
        return dict(
            window_s=window_s, requests_total=total[0], cost_total=total[1], p95_ms=p95,
            models={m: dict(requests=n, cost=c or 0.0, avg_latency_ms=lat or 0.0, hallucinations=h or 0,
                            quality=q, labeled=nl) for m, n, c, lat, h, q, nl in per_model},
        )
