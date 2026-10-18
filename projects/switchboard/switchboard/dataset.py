"""Synthetic workload with verifiable answers.

Every task carries what a grader needs to check an answer without an LLM judge:
a reference answer, plausible wrong answers (used by the simulated fleet), unit
tests for code tasks, and a context passage for grounded QA. Categories are hidden
from the router; it only ever sees the prompt text.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field

CATEGORIES = ["format", "classify", "extract", "math", "reasoning", "code", "rag_qa"]


@dataclass
class Task:
    id: str
    category: str
    prompt: str
    reference: str
    difficulty: float
    distractors: list[str] = field(default_factory=list)
    context: str | None = None
    tests: str | None = None  # python asserts, code tasks only
    bait: str | None = None  # an unsupported claim a model might fabricate (rag_qa)


MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]


def _format(rng: random.Random, i: int) -> Task:
    y, m, d = rng.randint(1990, 2030), rng.randint(1, 12), rng.randint(1, 28)
    style = rng.choice(["{M} {d}, {y}", "{d} {M} {y}", "{M} {d} {y}"])
    text = style.format(M=MONTHS[m - 1], d=d, y=y)
    ref = f"{y:04d}-{m:02d}-{d:02d}"
    wrong = f"{y:04d}-{d:02d}-{m:02d}" if d <= 12 and d != m else f"{y:04d}-{m:02d}-{d + 1 if d < 28 else d - 1:02d}"
    return Task(f"fmt-{i}", "format", f"Convert this date to ISO 8601 (YYYY-MM-DD): {text}",
                ref, rng.uniform(0.0, 0.2), [wrong])


TICKETS = {
    "billing": ["I was charged twice for my subscription", "my invoice shows the wrong amount",
                "please refund the duplicate payment", "why did my card get billed again"],
    "bug": ["the app crashes when I upload a photo", "export button throws an error",
            "page goes blank after login", "sync fails with a timeout every time"],
    "feature": ["it would be great to have dark mode", "can you add CSV export",
                "please support two-factor login via SMS", "I'd love keyboard shortcuts"],
    "account": ["I can't reset my password", "how do I change the email on my account",
                "please delete my account", "my username is locked out"],
}


def _classify(rng: random.Random, i: int) -> Task:
    label = rng.choice(list(TICKETS))
    body = rng.choice(TICKETS[label])
    hard = rng.random() < 0.4
    if hard:  # mix in a decoy signal from another class
        other = rng.choice([k for k in TICKETS if k != label])
        body = f"{body}. Unrelated, but last month {rng.choice(TICKETS[other])}, that's sorted now"
    prompt = ("Classify the support ticket into exactly one of: billing, bug, feature, account.\n"
              f"Ticket: \"{body}\"")
    wrong = [k for k in TICKETS if k != label]
    return Task(f"cls-{i}", "classify", prompt, label,
                rng.uniform(0.35, 0.55) if hard else rng.uniform(0.1, 0.3), wrong)


NAMES = ["Priya Raman", "Marco Silva", "Aiko Tanaka", "Lena Fischer", "Omar Haddad",
         "Grace Okafor", "Diego Ruiz", "Mei Chen", "Sam Patel", "Nora Lind"]
DOMAINS = ["example.com", "acme.io", "northwind.org", "contoso.net"]


def _email(rng: random.Random, name: str) -> str:
    first, last = name.lower().split()
    return f"{first}.{last}@{rng.choice(DOMAINS)}"


def _extract(rng: random.Random, i: int) -> Task:
    target, *decoys = rng.sample(NAMES, 3)
    n_decoys = rng.choice([0, 1, 2])
    emails = {n: _email(rng, n) for n in [target, *decoys]}
    lines = [f"Contact {target} at {emails[target]} about the renewal."]
    for d in decoys[:n_decoys]:
        lines.append(f"Loop in {d} ({emails[d]}) only if legal objects.")
    rng.shuffle(lines)
    prompt = (f"Extract the email address of {target} from the text. Reply with the address only.\n"
              f"Text: {' '.join(lines)}")
    wrong = [emails[d] for d in decoys] + [emails[target].replace("@", ".")]
    return Task(f"ext-{i}", "extract", prompt, emails[target], 0.2 + 0.15 * n_decoys, wrong)


def _math(rng: random.Random, i: int) -> Task:
    n_ops = rng.choice([1, 2, 3, 4])
    expr = str(rng.randint(2, 99))
    for _ in range(n_ops):
        expr += f" {rng.choice(['+', '-', '*'])} {rng.randint(2, 40)}"
    val = eval(expr)  # noqa: S307 - expression built from integers above
    wrong = [str(val + rng.choice([-10, -1, 1, 2, 10])), str(eval(expr.replace("*", "+", 1)))]
    return Task(f"math-{i}", "math", f"Compute {expr}. Give only the final number.",
                str(val), 0.15 + 0.15 * n_ops, [w for w in wrong if w != str(val)] or [str(val + 1)])


def _reasoning(rng: random.Random, i: int) -> Task:
    kind = rng.randrange(3)
    if kind == 0:
        a, more, k = rng.randint(3, 20), rng.randint(2, 9), rng.randint(2, 4)
        b = a + more
        c = k * b
        prompt = (f"Ana has {a} marbles. Ben has {more} more marbles than Ana. Cleo has {k} times as "
                  f"many marbles as Ben. How many marbles do the three have together?")
        ref, wrong = a + b + c, [a + b + k * a, c]
        diff = 0.6
    elif kind == 1:
        speed, hours, back = rng.randint(30, 80), rng.randint(2, 5), rng.randint(2, 6)
        dist = speed * hours
        prompt = (f"A train travels at {speed} km/h for {hours} hours, then returns along the same "
                  f"track taking {back} hours. What was its average speed for the return trip, in km/h, "
                  f"rounded down to an integer?")
        ref, wrong = dist // back, [speed, (2 * dist) // (hours + back)]
        diff = 0.7
    else:
        price, pct, qty = rng.randint(20, 200), rng.choice([10, 20, 25, 50]), rng.randint(2, 6)
        disc = price * (100 - pct) // 100
        prompt = (f"A jacket costs ${price}. It is discounted by {pct}%, and a further $5 coupon applies "
                  f"to each jacket after the discount. What do {qty} jackets cost in total, in dollars?")
        ref, wrong = qty * (disc - 5), [qty * disc - 5, qty * (price - 5)]
        diff = 0.85
    return Task(f"rsn-{i}", "reasoning", prompt + " Give only the final number.", str(ref),
                min(0.97, diff + rng.uniform(-0.05, 0.1)), [str(w) for w in wrong if w != ref] or [str(ref + 1)])


# (name, spec, correct body, buggy body, tests, difficulty)
CODE_BANK = [
    ("reverse_words", "returns the words of sentence s in reverse order, joined by single spaces",
     "return ' '.join(s.split()[::-1])", "return s[::-1]",
     "assert reverse_words('a b c') == 'c b a'\nassert reverse_words('  hi  there ') == 'there hi'", 0.3),
    ("sum_even", "returns the sum of the even integers in list xs",
     "return sum(x for x in xs if x % 2 == 0)", "return sum(x for x in xs if x % 2)",
     "assert sum_even([1,2,3,4]) == 6\nassert sum_even([]) == 0\nassert sum_even([-2,3]) == -2", 0.3),
    ("is_palindrome", "returns True if s is a palindrome ignoring case and non-alphanumerics",
     "t = [c.lower() for c in s if c.isalnum()]\n    return t == t[::-1]", "return s == s[::-1]",
     "assert is_palindrome('A man, a plan, a canal: Panama')\nassert not is_palindrome('ab')", 0.45),
    ("dedupe", "removes duplicates from list xs while preserving first-seen order",
     "seen = set()\n    out = []\n    for x in xs:\n        if x not in seen:\n            seen.add(x)\n            out.append(x)\n    return out",
     "return list(set(xs))",
     "assert dedupe([3,1,3,2,1]) == [3,1,2]\nassert dedupe([]) == []", 0.5),
    ("chunk", "splits list xs into consecutive chunks of size n (last chunk may be shorter)",
     "return [xs[i:i+n] for i in range(0, len(xs), n)]", "return [xs[i:i+n] for i in range(0, len(xs) - n, n)]",
     "assert chunk([1,2,3,4,5], 2) == [[1,2],[3,4],[5]]\nassert chunk([], 3) == []", 0.55),
    ("merge_intervals", "merges overlapping [start, end] intervals in list iv and returns them sorted",
     "out = []\n    for s, e in sorted(iv):\n        if out and s <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], e)\n        else:\n            out.append([s, e])\n    return out",
     "out = []\n    for s, e in iv:\n        if out and s <= out[-1][1]:\n            out[-1][1] = e\n        else:\n            out.append([s, e])\n    return out",
     "assert merge_intervals([[1,3],[2,6],[8,10]]) == [[1,6],[8,10]]\nassert merge_intervals([[5,7],[1,2],[1,9]]) == [[1,9]]", 0.75),
    ("lru_get_order", "given capacity c and a list of keys accessed in order, returns the keys left in an LRU cache from least to most recently used",
     "from collections import OrderedDict\n    d = OrderedDict()\n    for k in keys:\n        d.pop(k, None)\n        d[k] = 1\n        if len(d) > c:\n            d.popitem(last=False)\n    return list(d)",
     "d = []\n    for k in keys:\n        if k not in d:\n            d.append(k)\n        if len(d) > c:\n            d.pop(0)\n    return d",
     "assert lru_get_order(2, ['a','b','a','c']) == ['a','c']\nassert lru_get_order(1, ['x','y']) == ['y']", 0.85),
]


def _code(rng: random.Random, i: int) -> Task:
    name, spec, good, bad, tests, diff = rng.choice(CODE_BANK)
    args = {"reverse_words": "s", "sum_even": "xs", "is_palindrome": "s", "dedupe": "xs",
            "chunk": "xs, n", "merge_intervals": "iv", "lru_get_order": "c, keys"}[name]
    prompt = f"Write a Python function `{name}({args})` that {spec}. Return only the code in a ```python block."
    sol = lambda body: f"```python\ndef {name}({args}):\n    {body}\n```"  # noqa: E731
    return Task(f"code-{i}", "code", prompt, sol(good), min(0.95, diff + rng.uniform(-0.05, 0.05)),
                [sol(bad)], tests=tests)


PLACES = ["Varden", "Oslen", "Brightwater", "Calder", "Mirefield", "Ashgrove", "Tolvik", "Quarry Hill"]
THINGS = ["bridge", "library", "observatory", "dam", "lighthouse", "museum"]
ATTRS = [  # (attribute phrase, question phrase, value generator, unit)
    ("opened in", "In what year did the {t} open?", lambda r: str(r.randint(1850, 2015)), ""),
    ("is", "How tall is the {t}, in meters?", lambda r: str(r.randint(12, 380)), "meters tall"),
    ("was designed by", "Who designed the {t}?", lambda r: r.choice(NAMES), ""),
    ("cost", "How much did the {t} cost to build, in millions of dollars?", lambda r: str(r.randint(3, 900)), "million dollars to build"),
]


def _fact(t: str, place: str, attr: tuple, value: str) -> str:
    phrase, _, _, unit = attr
    return f"The {place} {t} {phrase} {value}{(' ' + unit) if unit else ''}."


def _rag(rng: random.Random, i: int) -> Task:
    thing = rng.choice(THINGS)
    place, decoy_place = rng.sample(PLACES, 2)
    n_facts = rng.choice([2, 3, 4])
    attrs = rng.sample(ATTRS, n_facts)
    values = {a[0]: a[2](rng) for a in attrs}
    facts = [_fact(thing, place, a, values[a[0]]) for a in attrs]
    harder = rng.random() < 0.5
    decoy_vals = {}
    if harder:  # a near-identical entity with different values
        for a in attrs[:2]:
            decoy_vals[a[0]] = a[2](rng)
            facts.append(_fact(thing, decoy_place, a, decoy_vals[a[0]]))
    rng.shuffle(facts)
    asked = attrs[0]
    ref = values[asked[0]]
    question = asked[1].format(t=f"{place} {thing}")
    prompt = ("Answer using only the context. Reply in one sentence.\n"
              f"Question: {question}")
    unused = [a for a in ATTRS if a not in attrs]
    if unused:
        bait = _fact(thing, place, unused[0], unused[0][2](rng)).replace(f"The {place} {thing}", "It also")
    else:
        bait = f"It also hosts an annual festival drawing {rng.randint(10, 90)} thousand visitors."
    wrong = [decoy_vals.get(asked[0]) or asked[2](rng)]
    return Task(f"rag-{i}", "rag_qa", prompt, ref, 0.3 + 0.1 * n_facts + (0.15 if harder else 0.0),
                [w for w in wrong if w != ref] or [asked[2](rng)], context=" ".join(facts), bait=bait)


GENERATORS = {"format": _format, "classify": _classify, "extract": _extract, "math": _math,
              "reasoning": _reasoning, "code": _code, "rag_qa": _rag}

# A realistic production mix: lots of cheap traffic, a long tail of hard work.
DEFAULT_MIX = {"format": 0.18, "classify": 0.2, "extract": 0.16, "math": 0.12,
               "reasoning": 0.1, "code": 0.12, "rag_qa": 0.12}


def generate(n: int, seed: int = 0, mix: dict[str, float] | None = None) -> list[Task]:
    rng = random.Random(seed)
    mix = mix or DEFAULT_MIX
    cats, weights = zip(*mix.items())
    return [GENERATORS[rng.choices(cats, weights)[0]](rng, i) for i in range(n)]
