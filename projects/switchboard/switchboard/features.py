"""Prompt -> feature vector. The router sees nothing else about a request."""

from __future__ import annotations

import math
import re
import zlib

import numpy as np

HASH_DIM = 64

CUES = {
    "code": r"\b(def|function|python|code|class|return|implement|```)\b",
    "math": r"\b(compute|calculate|sum|product)\b|[\d)]\s*[-+*/]\s*[\d(]",
    "reason": r"\b(more than|times as|each|total|average|rounded|discount|if|then|together)\b",
    "extract": r"\b(extract|email|address|phone|from the text)\b",
    "classify": r"\b(classify|category|one of|label)\b",
    "format": r"\b(convert|format|iso|yyyy)\b",
    "grounded": r"\b(context|according to|using only)\b",
}
HAND = ["bias", "log_len", "digit_ratio", "n_numbers", "has_context", "log_ctx_len",
        "n_operators", "ctx_sentences", "n_entities", "n_at", *CUES]
DIM = len(HAND) + HASH_DIM


def _hash(tok: str) -> tuple[int, float]:
    h = zlib.crc32(tok.encode())
    return h % HASH_DIM, 1.0 if (h >> 16) & 1 else -1.0


def featurize(prompt: str, context: str | None = None) -> np.ndarray:
    p = prompt.lower()
    words = re.findall(r"[a-z]+", p)
    x = np.zeros(DIM)
    x[0] = 1.0
    x[1] = math.log1p(len(p.split())) / 5
    x[2] = sum(c.isdigit() for c in p) / max(1, len(p)) * 5
    x[3] = min(len(re.findall(r"\d+", p)), 10) / 10
    x[4] = 1.0 if context else 0.0
    x[5] = math.log1p(len((context or "").split())) / 5
    ctx = context or ""
    x[6] = min(len(re.findall(r"\d\s*[-+*/]\s*\d", p)), 6) / 6
    x[7] = min(len(re.findall(r"[.!?](\s|$)", ctx)), 8) / 8
    x[8] = min(len(set(re.findall(r"\b[A-Z][a-z]+\b", prompt + " " + ctx))), 12) / 12
    x[9] = min(p.count("@"), 4) / 4
    for j, pat in enumerate(CUES.values()):
        x[10 + j] = min(len(re.findall(pat, p)), 3) / 3
    # signed feature hashing over unigrams + bigrams catches what the cues miss
    grams = words + [f"{a}_{b}" for a, b in zip(words, words[1:])]
    if grams:
        h = np.zeros(HASH_DIM)
        for g in grams:
            i, s = _hash(g)
            h[i] += s
        x[len(HAND):] = h / math.sqrt(len(grams))
    return x
