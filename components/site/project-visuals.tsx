"use client"

import { useEffect, useMemo, useState } from "react"
import { useInView } from "./reveal"

/* ------------------------------------------------------------------ *
 * Shared chrome — every project visual sits in the same "app window".
 * ------------------------------------------------------------------ */

export function VizFrame({
  slug,
  caption,
  children,
}: {
  slug: string
  caption: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface-2">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
          <span className="h-2 w-2 rounded-full bg-line-strong" />
        </span>
        <span className="truncate font-mono text-[10px] text-muted">{slug}</span>
      </div>
      <div className="p-4">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{caption}</div>
        {children}
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  readout,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  readout: string
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {label}
        <span className="text-accent">{readout}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-[var(--accent)]"
        aria-label={label}
      />
    </label>
  )
}

/* ------------------------------------------------------------------ *
 * 01 — medrag-toolkit: slide the dense/sparse mix and watch the
 * candidate set re-rank, then pass through the citation gate.
 * ------------------------------------------------------------------ */

type Doc = { id: string; src: string; title: string; dense: number; sparse: number }

const DOCS: Doc[] = [
  { id: "d1", src: "PubMed", title: "metformin renal dosing", dense: 0.94, sparse: 0.41 },
  { id: "d2", src: "RxNorm", title: "metformin HCl 500mg", dense: 0.52, sparse: 0.93 },
  { id: "d3", src: "PubMed", title: "contrast-induced AKI", dense: 0.81, sparse: 0.55 },
  { id: "d4", src: "OpenFDA", title: "label: lactic acidosis", dense: 0.46, sparse: 0.78 },
  { id: "d5", src: "PubMed", title: "eGFR thresholds review", dense: 0.68, sparse: 0.34 },
]

const ROW_H = 25

export function MedragViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [mix, setMix] = useState(60)

  const alpha = mix / 100
  const scored = useMemo(
    () =>
      DOCS.map((d) => ({ ...d, score: alpha * d.dense + (1 - alpha) * d.sparse })).sort((a, b) => b.score - a.score),
    [alpha],
  )

  const rankOf = useMemo(() => {
    const m = new Map<string, number>()
    scored.forEach((d, i) => m.set(d.id, i))
    return m
  }, [scored])

  // Only well-supported passages make it past the gate into the citation list.
  const cited = scored.filter((d) => d.score >= 0.6).length
  const grounded = cited > 0

  return (
    <div ref={ref}>
      <VizFrame slug="medrag-toolkit / hybrid retrieval · citation gate" caption="Dense + sparse · rerank · grounding">
        <div className="relative" style={{ height: DOCS.length * ROW_H }}>
          {DOCS.map((d) => {
            const s = scored.find((x) => x.id === d.id)!
            const rank = rankOf.get(d.id) ?? 0
            const top = rank === 0
            return (
              <div
                key={d.id}
                className="absolute inset-x-0 flex items-center gap-2"
                style={{
                  transform: `translateY(${rank * ROW_H}px)`,
                  transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span className="w-[52px] shrink-0 font-mono text-[9px] uppercase tracking-wider text-muted">
                  {d.src}
                </span>
                <span
                  className="w-[104px] shrink-0 truncate font-mono text-[10px]"
                  style={{ color: top ? "var(--accent)" : "var(--ink-2)", transition: "color 0.35s ease" }}
                >
                  {d.title}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${(inView ? s.score : 0) * 100}%`,
                      background: s.score >= 0.6 ? "var(--accent)" : "var(--line-strong)",
                      transition: "width 0.5s cubic-bezier(0.22,1,0.36,1), background 0.35s ease",
                    }}
                  />
                </span>
                <span className="w-[30px] shrink-0 text-right font-mono text-[10px] tabular-nums text-muted">
                  {s.score.toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-4">
          <Slider
            label="Sparse ← mix → dense"
            value={mix}
            min={0}
            max={100}
            onChange={setMix}
            readout={`${mix}% dense`}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <svg viewBox="0 0 46 12" className="h-3 w-[46px] shrink-0" aria-hidden>
            <line
              x1="0"
              y1="6"
              x2="46"
              y2="6"
              stroke="var(--accent)"
              strokeWidth="1.4"
              strokeDasharray="5 3"
              className={inView ? "marching" : undefined}
            />
          </svg>
          <span
            className="rounded-md border px-2 py-1 font-mono text-[10px]"
            style={{
              borderColor: grounded ? "var(--accent)" : "var(--line-strong)",
              color: grounded ? "var(--accent)" : "var(--muted)",
              background: grounded ? "var(--accent-soft)" : "transparent",
              transition: "all 0.35s ease",
            }}
          >
            citation gate
          </span>
          <span className="font-mono text-[10px] text-muted">
            {grounded ? `${cited} passage${cited > 1 ? "s" : ""} cited` : "no passage clears threshold"}
          </span>
        </div>

        <p className="mt-3 font-mono text-[10px] text-muted">
          Drag the mix · <span className="text-accent">BM25 over Qdrant</span> at 0%,{" "}
          <span className="text-accent">FAISS</span> at 100%
        </p>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 02 — Clinical RAG: a request trace walking the pipeline, then the
 * measured RAGAS results filling in.
 * ------------------------------------------------------------------ */

const STAGES = ["query", "guardrail", "retrieve", "rerank", "generate", "score"]
const BARS = [
  { k: "response relevance", v: 91 },
  { k: "hallucination reduction", v: 38 },
  { k: "verification time saved", v: 45 },
]

export function ClinragViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!inView || paused) return
    const t = setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 2)), 620)
    return () => clearInterval(t)
  }, [inView, paused])

  const done = step >= STAGES.length

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <VizFrame slug="clinical-rag / 5,000+ WHO · NIMH guidelines" caption="Request trace · RAGAS result">
        {/* wraps to two rows on a narrow card rather than truncating stage names */}
        <ol className="flex flex-wrap items-center gap-1">
          {STAGES.map((s, i) => {
            const active = i === step
            const passed = i < step
            return (
              <li key={s} className="flex min-w-[68px] flex-1 items-center gap-1">
                <span
                  className="block w-full truncate rounded-md border px-1.5 py-1.5 text-center font-mono text-[9px]"
                  style={{
                    borderColor: active ? "var(--accent)" : passed ? "var(--accent-soft)" : "var(--line)",
                    background: active ? "var(--accent)" : passed ? "var(--accent-soft)" : "var(--surface)",
                    color: active ? "#fff" : passed ? "var(--accent)" : "var(--muted)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {s}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-5 space-y-3">
          {BARS.map((b) => (
            <div key={b.k}>
              <div className="flex items-baseline justify-between font-mono text-[10px]">
                <span className="text-ink-2">{b.k}</span>
                <span className="tabular-nums text-accent">{done ? `${b.v}%` : "--"}</span>
              </div>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{
                    width: `${done ? b.v : 0}%`,
                    transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[10px] text-muted">
          {paused ? "Paused · move away to resume" : "Replaying a traced request"} ·{" "}
          <span className="text-accent">benchmarked with RAGAS vs. GPT-4</span>
        </p>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 03 — Buildify: the gating network routing a constraint graph to one
 * room-type expert. Auto-cycles; hover an expert to hold it.
 * ------------------------------------------------------------------ */

const EXPERTS = [
  { id: "bedroom", cells: [0, 1, 4] },
  { id: "kitchen", cells: [2, 3] },
  { id: "bath", cells: [6] },
  { id: "living", cells: [5, 7, 8] },
]

export function BuildifyViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [hover, setHover] = useState<string | null>(null)
  const [cycle, setCycle] = useState(0)

  const auto = EXPERTS[cycle % EXPERTS.length].id
  const active = hover ?? auto
  const activeIdx = EXPERTS.findIndex((e) => e.id === active)

  useEffect(() => {
    if (!inView || hover) return
    const t = setInterval(() => setCycle((c) => c + 1), 2200)
    return () => clearInterval(t)
  }, [inView, hover])

  const litCells = EXPERTS[activeIdx]?.cells ?? []

  return (
    <div ref={ref}>
      <VizFrame slug="buildify / room-constraint graph → MoE" caption="Gating network · expert routing">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div>
            <svg viewBox="0 0 190 96" className="w-full" role="img" aria-label="Constraint graph routed to a room-type expert">
              {[
                [16, 34],
                [46, 20],
                [46, 50],
                [76, 36],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4.5" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.3" />
              ))}
              <path
                d="M20,34 L42,20 M20,34 L42,50 M50,20 L72,36 M50,50 L72,36"
                stroke="var(--line-strong)"
                strokeWidth="0.9"
                fill="none"
              />
              <text x="46" y="72" textAnchor="middle" fontSize="7" className="font-mono" fill="var(--muted)">
                GCN x3
              </text>

              <line
                x1="82"
                y1="36"
                x2="106"
                y2="36"
                stroke="var(--accent)"
                strokeWidth="1.4"
                strokeDasharray="5 3"
                className={inView ? "marching" : undefined}
              />
              <rect
                x="108"
                y="26"
                width="46"
                height="20"
                rx="4"
                fill="var(--accent-soft)"
                stroke="var(--accent)"
                strokeOpacity="0.45"
              />
              <text x="131" y="39" textAnchor="middle" fontSize="8" className="font-mono" fill="var(--accent)">
                gating
              </text>
              <line
                x1="131"
                y1="48"
                x2="131"
                y2={58 + activeIdx * 0}
                stroke="var(--line-strong)"
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <text x="131" y="72" textAnchor="middle" fontSize="7" className="font-mono" fill="var(--muted)">
                routes to
              </text>
            </svg>

            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {EXPERTS.map((e) => {
                const on = e.id === active
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setHover(e.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(e.id)}
                      onBlur={() => setHover(null)}
                      className="w-full rounded-md border px-2 py-1.5 text-left font-mono text-[10px]"
                      style={{
                        borderColor: on ? "var(--accent)" : "var(--line)",
                        background: on ? "var(--accent-soft)" : "var(--surface)",
                        color: on ? "var(--accent)" : "var(--muted)",
                        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {e.id}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="shrink-0">
            <div className="grid grid-cols-3 gap-1 rounded-md border border-line bg-surface p-1.5">
              {Array.from({ length: 9 }, (_, i) => (
                <span
                  key={i}
                  className="h-[18px] w-[18px] rounded-[3px]"
                  style={{
                    background: litCells.includes(i) ? "var(--accent)" : "var(--surface-2)",
                    opacity: litCells.includes(i) ? 0.85 : 1,
                    transition: "background 0.45s ease, opacity 0.45s ease",
                  }}
                />
              ))}
            </div>
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-wider text-muted">layout</p>
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px] text-muted">
          {hover ? "Held · move away to resume" : "Auto-cycling · hover an expert"} ·{" "}
          <span className="text-accent">INT8, single GPU</span>
        </p>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 04 — Mental health prediction: text and structured inputs meeting at
 * an ensemble, with the predicted category cycling.
 * ------------------------------------------------------------------ */

const TOKENS = ["sleep", "appetite", "worry", "energy", "focus", "mood"]

export function MhapsViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [tick, setTick] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!inView || paused) return
    const t = setInterval(() => setTick((n) => n + 1), 520)
    return () => clearInterval(t)
  }, [inView, paused])

  const phase = tick % 12
  const litTokens = Math.min(TOKENS.length, phase)
  const ensembleOn = phase >= TOKENS.length
  const category = ensembleOn ? Math.floor(tick / 12) % 3 : -1

  return (
    <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <VizFrame slug="mh-predict / multi-modal ensemble" caption="Free text + records → 3 categories">
        <div className="flex flex-wrap gap-1.5">
          {TOKENS.map((t, i) => (
            <span
              key={t}
              className="rounded border px-1.5 py-1 font-mono text-[10px]"
              style={{
                borderColor: i < litTokens ? "var(--accent)" : "var(--line)",
                background: i < litTokens ? "var(--accent-soft)" : "var(--surface)",
                color: i < litTokens ? "var(--accent)" : "var(--muted)",
                transition: "all 0.35s ease",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted">TF-IDF features</p>

        <div className="mt-4 flex items-center gap-2">
          <span
            className="rounded-md border px-2.5 py-1.5 font-mono text-[10px]"
            style={{
              borderColor: ensembleOn ? "var(--accent)" : "var(--line)",
              background: ensembleOn ? "var(--accent-soft)" : "var(--surface)",
              color: ensembleOn ? "var(--accent)" : "var(--muted)",
              transition: "all 0.35s ease",
            }}
          >
            ensemble
          </span>
          <svg viewBox="0 0 40 12" className="h-3 w-10 shrink-0" aria-hidden>
            <line
              x1="0"
              y1="6"
              x2="40"
              y2="6"
              stroke={ensembleOn ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth="1.4"
              strokeDasharray="5 3"
              className={ensembleOn && inView ? "marching" : undefined}
            />
          </svg>
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="flex-1 rounded-md border py-1.5 text-center font-mono text-[10px]"
                style={{
                  borderColor: category === i ? "var(--accent)" : "var(--line)",
                  background: category === i ? "var(--accent)" : "var(--surface)",
                  color: category === i ? "#fff" : "var(--muted)",
                  transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                cat {i + 1}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] text-muted">
          {paused ? "Paused · move away to resume" : "Cycling a screening record"} ·{" "}
          <span className="text-accent">TF-IDF + ensemble over 10K+ records</span>
        </p>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 05 — Recommendation graph: hover a node to light up its
 * neighbourhood; the churn gauge tracks the focused subscriber.
 * ------------------------------------------------------------------ */

type GNode = { id: string; label: string; x: number; y: number; churn: number }

const NODES: GNode[] = [
  { id: "u1", label: "Viewer A", x: 50, y: 46, churn: 12 },
  { id: "t1", label: "Thriller", x: 120, y: 22, churn: 0 },
  { id: "t2", label: "Docs", x: 128, y: 78, churn: 0 },
  { id: "u2", label: "Viewer B", x: 196, y: 34, churn: 68 },
  { id: "t3", label: "K-drama", x: 202, y: 96, churn: 0 },
  { id: "u3", label: "Viewer C", x: 268, y: 62, churn: 41 },
  { id: "t4", label: "Comedy", x: 274, y: 14, churn: 0 },
]

const EDGES: [string, string][] = [
  ["u1", "t1"],
  ["u1", "t2"],
  ["t1", "u2"],
  ["t2", "u2"],
  ["t2", "t3"],
  ["u2", "t4"],
  ["u2", "t3"],
  ["t3", "u3"],
  ["t4", "u3"],
]

export function NetflixViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [hover, setHover] = useState<string | null>(null)
  const [cycle, setCycle] = useState(0)

  const viewers = useMemo(() => NODES.filter((n) => n.id.startsWith("u")), [])
  const auto = viewers[cycle % viewers.length].id
  const focus = hover ?? auto
  const focusNode = NODES.find((n) => n.id === focus) ?? NODES[0]

  useEffect(() => {
    if (!inView || hover) return
    const t = setInterval(() => setCycle((c) => c + 1), 2600)
    return () => clearInterval(t)
  }, [inView, hover])

  const neighbors = useMemo(() => {
    const set = new Set<string>()
    for (const [a, b] of EDGES) {
      if (a === focus) set.add(b)
      if (b === focus) set.add(a)
    }
    return set
  }, [focus])

  const churn = focusNode.churn || 0
  const R = 26
  const C = 2 * Math.PI * R

  return (
    <div ref={ref}>
      <VizFrame slug="streaming-rec / 10M+ viewer records" caption="Graph neighbourhood · churn signal">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <svg viewBox="0 0 320 118" className="w-full" role="img" aria-label="Recommendation graph">
            {EDGES.map(([a, b], i) => {
              const na = NODES.find((n) => n.id === a)!
              const nb = NODES.find((n) => n.id === b)!
              const on = a === focus || b === focus
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={on ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={on ? 1.8 : 1}
                  strokeDasharray={on ? "5 3" : undefined}
                  className={on && inView ? "marching" : undefined}
                  opacity={on ? 1 : 0.55}
                  style={{ transition: "stroke 0.35s ease, opacity 0.35s ease" }}
                />
              )
            })}

            {NODES.map((n) => {
              const isFocus = n.id === focus
              const isNeighbor = neighbors.has(n.id)
              const isUser = n.id.startsWith("u")
              const r = isFocus ? 9 : isUser ? 7 : 5.5
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer"
                >
                  {isFocus && (
                    <circle cx={n.x} cy={n.y} r={16} fill="var(--accent)" opacity="0.14" className="pulse-dot" />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill={isFocus ? "var(--accent)" : isNeighbor ? "var(--accent-2)" : "var(--surface)"}
                    stroke={isFocus || isNeighbor ? "transparent" : "var(--line-strong)"}
                    strokeWidth="1.5"
                    style={{ transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  <text
                    x={n.x}
                    y={n.y - r - 5}
                    textAnchor="middle"
                    fontSize="8"
                    className="pointer-events-none font-mono"
                    fill={isFocus ? "var(--accent)" : "var(--muted)"}
                    style={{ transition: "fill 0.35s ease" }}
                  >
                    {n.label}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="flex items-center gap-4 sm:flex-col sm:gap-2">
            <svg viewBox="0 0 70 70" className="h-[70px] w-[70px] shrink-0" role="img" aria-label="Churn probability">
              <circle cx="35" cy="35" r={R} fill="none" stroke="var(--line)" strokeWidth="6" />
              <circle
                cx="35"
                cy="35"
                r={R}
                fill="none"
                stroke={churn > 50 ? "var(--warn)" : "var(--good)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - (inView ? churn : 0) / 100)}
                transform="rotate(-90 35 35)"
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1), stroke 0.35s ease" }}
              />
              <text
                x="35"
                y="38"
                textAnchor="middle"
                fontSize="15"
                className="font-mono font-semibold tabular-nums"
                fill="var(--ink)"
              >
                {churn}
              </text>
            </svg>
            <div className="font-mono text-[10px] leading-relaxed text-muted sm:text-center">
              <div className="uppercase tracking-wider">Churn p</div>
              <div className="text-accent">{focusNode.label}</div>
            </div>
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px] text-muted">
          {hover ? "Locked · move away to resume" : "Auto-cycling · hover a node to inspect"} ·{" "}
          <span className="text-accent">{neighbors.size} linked nodes</span>
        </p>
      </VizFrame>
    </div>
  )
}

export const VISUALS = {
  medrag: MedragViz,
  clinrag: ClinragViz,
  buildify: BuildifyViz,
  mhaps: MhapsViz,
  netflix: NetflixViz,
} as const
