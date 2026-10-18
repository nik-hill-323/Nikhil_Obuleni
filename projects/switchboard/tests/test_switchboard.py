import json
import os
import sys
import unittest

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from switchboard import evals, ops  # noqa: E402
from switchboard.backends import SimulatedBackend  # noqa: E402
from switchboard.cli import DEFAULT_FLEET, gate, load_fleet  # noqa: E402
from switchboard.dataset import CATEGORIES, generate  # noqa: E402
from switchboard.features import DIM, featurize  # noqa: E402
from switchboard.judge import final_answer, grade, run_tests, unsupported_claims  # noqa: E402
from switchboard.router import BanditRouter, RouteRequest, StaticPolicy  # noqa: E402
from switchboard.tracing import TraceStore  # noqa: E402


class TestGraders(unittest.TestCase):
    def test_reference_answers_pass_and_distractors_fail(self):
        for t in generate(300, seed=3):
            text = t.reference if t.category == "code" else (
                f"The answer is {t.reference}." if t.category != "rag_qa" else f"It is {t.reference}.")
            self.assertTrue(grade(t, text).correct, (t.category, t.prompt))
            self.assertFalse(grade(t, t.distractors[0]).correct, (t.category, t.distractors[0]))

    def test_final_answer_formats(self):
        self.assertEqual(final_answer("Answer: 2024-03-05"), "2024-03-05")
        self.assertEqual(final_answer("Let me think.\nThe answer is 42."), "42")
        self.assertEqual(final_answer("billing"), "billing")

    def test_code_runs_in_isolation(self):
        self.assertTrue(run_tests("def f(x):\n    return x + 1", "assert f(1) == 2"))
        self.assertFalse(run_tests("def f(x):\n    return x", "assert f(1) == 2"))
        self.assertFalse(run_tests("while True:\n    pass", "", timeout=0.5))

    def test_groundedness_flags_fabricated_numbers(self):
        ctx = "The Varden bridge opened in 1932. The Varden bridge is 410 meters tall."
        self.assertEqual(unsupported_claims("It opened in 1932.", ctx), [])
        self.assertEqual(len(unsupported_claims("It opened in 1932. It cost 85 million dollars to build.", ctx)), 1)


class TestDataset(unittest.TestCase):
    def test_deterministic_and_covers_all_categories(self):
        a, b = generate(200, seed=5), generate(200, seed=5)
        self.assertEqual([t.prompt for t in a], [t.prompt for t in b])
        self.assertEqual({t.category for t in generate(500, seed=1)}, set(CATEGORIES))


class TestRouter(unittest.TestCase):
    def setUp(self):
        self.specs = load_fleet(DEFAULT_FLEET)
        self.backends = {s.name: SimulatedBackend(s) for s in self.specs}

    def test_features_shape(self):
        self.assertEqual(featurize("Compute 3 + 4.").shape, (DIM,))

    def test_learns_to_beat_keyword_rules_and_save_cost(self):
        train, test = generate(600, seed=1), generate(400, seed=2)
        m = evals.outcome_matrix(train + test, self.backends)
        r = evals.train_offline(BanditRouter(self.specs, lam=0.1, alpha=0.0), train, m)
        router = evals.summarize(evals.run_policy(r, test, m))
        frontier = evals.summarize(evals.run_policy(StaticPolicy("frontier"), test, m))
        self.assertGreater(router["quality"], 0.92 * frontier["quality"])
        self.assertLess(router["cost_per_1k"], 0.8 * frontier["cost_per_1k"])

    def test_constraints_are_respected(self):
        r = BanditRouter(self.specs)
        x = featurize("Prove the Riemann hypothesis.")
        d = r.choose(x, RouteRequest(tokens_in=50, max_cost=1e-5))
        self.assertTrue(d.scores[d.model]["est_cost"] <= 1e-5 or not any(s["feasible"] for s in d.scores.values()))

    def test_save_load_roundtrip(self):
        r = BanditRouter(self.specs)
        x = featurize("Compute 3 + 4.")
        r.update(x, "mini", 1.0, 300, 10)
        clone = BanditRouter.from_dict(json.loads(json.dumps(r.to_dict())))
        self.assertAlmostEqual(r.predict(x, "mini"), clone.predict(x, "mini"))

    def test_forget_shrinks_confidence(self):
        r = BanditRouter(self.specs)
        x = featurize("Compute 3 + 4.")
        for _ in range(50):
            r.update(x, "mini", 1.0, 300, 10)
        before = x @ r.A_inv["mini"] @ x
        r.forget("mini")
        self.assertGreater(x @ r.A_inv["mini"] @ x, before)


class TestOps(unittest.TestCase):
    def test_page_hinkley_fires_on_drop_not_on_noise(self):
        rng = np.random.default_rng(0)
        ph = ops.PageHinkley(delta=0.05, threshold=5.0, direction=-1)
        self.assertFalse(any(ph.update(v) for v in rng.normal(0, 0.3, 500)))
        self.assertTrue(any(ph.update(v) for v in rng.normal(-0.6, 0.3, 100)))

    def test_regression_is_detected(self):
        specs = load_fleet(DEFAULT_FLEET)
        backends = {s.name: SimulatedBackend(s) for s in specs}
        train = generate(600, seed=1)
        r = evals.train_offline(BanditRouter(specs, lam=0.1), train, evals.outcome_matrix(train, backends))
        out = ops.simulate(generate(2500, seed=9), backends, [r], ops.default_incidents(2500))
        kinds = {(a["model"], a["kind"]) for a in out["alerts"]}
        self.assertIn(("coder", "quality_drop"), kinds)
        self.assertIn(("frontier", "latency_spike"), kinds)


class TestGate(unittest.TestCase):
    RULES = dict(reference_policy="always-frontier", max_quality_drop=0.01, max_cost_increase=0.1,
                 max_hallucination_rate=0.08, min_quality_vs_reference=0.95)

    def _res(self, q, c, h=0.02):
        return {"policies": {"switchboard": dict(quality=q, cost_per_1k=c, hallucination_rate=h),
                             "always-frontier": dict(quality=0.96, cost_per_1k=1.0, hallucination_rate=0.02)}}

    def test_passes_and_fails(self):
        base = self._res(0.94, 0.5)
        self.assertEqual(gate(self._res(0.94, 0.5), base, self.RULES), [])
        self.assertEqual(len(gate(self._res(0.90, 0.5), base, self.RULES)), 2)
        self.assertEqual(len(gate(self._res(0.94, 0.6), base, self.RULES)), 1)


class TestTracing(unittest.TestCase):
    def test_feedback_roundtrip(self):
        ts = TraceStore()
        tid = ts.log(router_version="v0", model="mini", prompt_sha="x", tokens_in=1, tokens_out=2, cost=0.1,
                     latency_ms=5, hallucinated=False, features=[1.0], scores={})
        self.assertEqual(ts.feedback(tid, 1.0)["model"], "mini")
        self.assertIsNone(ts.feedback("missing", 1.0))
        self.assertEqual(ts.stats()["models"]["mini"]["quality"], 1.0)


if __name__ == "__main__":
    unittest.main()
