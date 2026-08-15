"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
 * 01 — Retail demand forecasting: drag the markdown, watch the
 * forecast, the revenue, and the stockout risk move together.
 * ------------------------------------------------------------------ */

const WEEKS_ACTUAL = [62, 58, 71, 66, 78, 74, 88, 81, 95, 90, 104, 99]
const BASE_FORECAST = [107, 112, 108, 118, 121, 116]
const BASE_PRICE = 24

export function RetailViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [markdown, setMarkdown] = useState(15)

  const W = 320
  const H = 128
  const all = [...WEEKS_ACTUAL, ...BASE_FORECAST]

  // A markdown lifts unit demand with diminishing returns while cutting unit
  // price — so revenue peaks at an interior depth rather than at zero. That
  // peak is the whole point of the optimizer, so the widget marks it.
  const liftAt = (m: number) => 1 + 2.2 * (m / 100) - 1.6 * Math.pow(m / 100, 2)
  const revenueAt = (m: number) =>
    BASE_FORECAST.reduce((a, b) => a + b, 0) * liftAt(m) * BASE_PRICE * (1 - m / 100)

  const optimal = useMemo(() => {
    let best = 0
    for (let m = 0; m <= 40; m++) if (revenueAt(m) > revenueAt(best)) best = m
    return best
  }, [])

  const forecast = BASE_FORECAST.map((v) => v * liftAt(markdown))

  // Fixed to the deepest-markdown case so the forecast visibly climbs as you drag.
  const max = Math.max(...WEEKS_ACTUAL, ...BASE_FORECAST.map((v) => v * liftAt(40))) * 1.08
  const x = (i: number) => (i / (all.length - 1)) * W
  const y = (v: number) => H - (v / max) * H

  const actualPath = WEEKS_ACTUAL.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
  const fcPath = [WEEKS_ACTUAL[WEEKS_ACTUAL.length - 1], ...forecast]
    .map((v, i) => {
      const idx = WEEKS_ACTUAL.length - 1 + i
      return `${i === 0 ? "M" : "L"}${x(idx).toFixed(1)},${y(v).toFixed(1)}`
    })
    .join(" ")

  const revenue = revenueAt(markdown)
  const delta = ((revenue - revenueAt(0)) / revenueAt(0)) * 100
  const stockout = Math.max(2, 34 - markdown * 0.75)
  const atOptimum = markdown === optimal

  return (
    <div ref={ref}>
      <VizFrame slug="retail-forecast / weekly units · 12w history + 6w horizon" caption="Demand · forecast · markdown">
        <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" role="img" aria-label="Weekly demand with forecast">
          <defs>
            <linearGradient id="retailFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="var(--line)" strokeWidth="1" />
          ))}

          {/* history */}
          <path d={`${actualPath} L${x(WEEKS_ACTUAL.length - 1)},${H} L0,${H} Z`} fill="url(#retailFill)" />
          <path
            d={actualPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 700,
              strokeDashoffset: inView ? 0 : 700,
              transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />

          {/* forecast horizon */}
          <line
            x1={x(WEEKS_ACTUAL.length - 1)}
            x2={x(WEEKS_ACTUAL.length - 1)}
            y1="0"
            y2={H}
            stroke="var(--line-strong)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d={fcPath}
            fill="none"
            stroke="var(--accent-2)"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
            className="transition-[d] duration-300"
          />
          {forecast.map((v, i) => (
            <circle
              key={i}
              cx={x(WEEKS_ACTUAL.length + i)}
              cy={y(v)}
              r="2.6"
              fill="var(--surface)"
              stroke="var(--accent-2)"
              strokeWidth="1.6"
              className="transition-all duration-300"
            />
          ))}

          <text x="2" y={H + 11} className="fill-[var(--muted)] font-mono" fontSize="8">
            ACTUAL
          </text>
          <text x={x(WEEKS_ACTUAL.length - 1) + 3} y={H + 11} className="fill-[var(--muted)] font-mono" fontSize="8">
            FORECAST
          </text>
        </svg>

        <div className="mt-4">
          <Slider
            label="Markdown depth"
            value={markdown}
            min={0}
            max={40}
            onChange={setMarkdown}
            readout={`${markdown}%`}
          />
          <button
            type="button"
            onClick={() => setMarkdown(optimal)}
            className={`mt-2 rounded-full border px-2.5 py-1 font-mono text-[10px] transition ${
              atOptimum
                ? "border-good bg-good/10 text-good"
                : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {atOptimum ? `✓ at optimum · ${optimal}%` : `jump to A/B-tested optimum · ${optimal}%`}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { k: "Horizon revenue", v: `$${(revenue / 1000).toFixed(1)}k` },
            { k: "vs. no markdown", v: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`, tone: delta >= 0 },
            { k: "Stockout risk", v: `${stockout.toFixed(0)}%` },
          ].map((m) => (
            <div key={m.k} className="rounded-lg border border-line bg-surface px-2.5 py-2">
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted">{m.k}</div>
              <div
                className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums"
                style={{ color: m.tone === false ? "var(--warn)" : "var(--ink)" }}
              >
                {m.v}
              </div>
            </div>
          ))}
        </div>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 02 — Recommendation graph: hover a node to light up its
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
          {hover ? "Locked — move away to resume" : "Auto-cycling · hover a node to inspect"} ·{" "}
          <span className="text-accent">{neighbors.size} linked nodes</span>
        </p>
      </VizFrame>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * 03 — Traffic risk grid: scrub the hour, watch the city's
 * accident-risk surface and its top hotspots re-rank.
 * ------------------------------------------------------------------ */

const COLS = 12
const ROWS = 6

/** Eight fixed districts laid over the grid, so a cell always reports the same name. */
const ZONES = [
  ["West End", "Downtown", "North Loop", "Union Sq"],
  ["Riverside", "Midtown", "Airport Rd", "Eastside"],
]

const zoneOf = (x: number, y: number) =>
  ZONES[Math.min(1, Math.floor(y / (ROWS / 2)))][Math.min(3, Math.floor(x / (COLS / 4)))]

/** Deterministic risk surface — commuter peaks over fixed hotspot centres. */
function risk(cx: number, cy: number, hour: number) {
  const hotspots = [
    { x: 3, y: 2, w: 1.0, peak: 8 },
    { x: 8, y: 4, w: 0.85, peak: 17 },
    { x: 6, y: 1, w: 0.7, peak: 22 },
    { x: 10, y: 2, w: 0.6, peak: 12 },
  ]

  let v = 0.08
  for (const h of hotspots) {
    const d = Math.hypot(cx - h.x, cy - h.y)
    const spatial = Math.exp(-(d * d) / 6)
    // circular distance in hours, so 23:00 sits next to 00:00
    const dh = Math.min(Math.abs(hour - h.peak), 24 - Math.abs(hour - h.peak))
    const temporal = Math.exp(-(dh * dh) / 9)
    v += h.w * spatial * temporal
  }
  const nightlift = hour >= 23 || hour <= 3 ? 0.12 : 0
  return Math.min(1, v + nightlift)
}

export function TrafficViz() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [hour, setHour] = useState(8)
  const [playing, setPlaying] = useState(true)
  const touched = useRef(false)

  useEffect(() => {
    if (!inView || !playing) return
    const t = setInterval(() => setHour((h) => (h + 1) % 24), 700)
    return () => clearInterval(t)
  }, [inView, playing])

  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = []
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) out.push({ x, y, v: risk(x, y, hour) })
    return out
  }, [hour])

  // Greedy non-max suppression: take the hottest cell, then the hottest cell
  // that isn't in the same cluster, and so on — always three distinct hotspots.
  const top = useMemo(() => {
    const sorted = [...cells].sort((a, b) => b.v - a.v)
    const picked: typeof sorted = []
    // First pass insists on three different districts; later passes relax the
    // constraint so the list is always full even when risk is concentrated.
    for (const [radius, uniqueZone] of [
      [2.5, true],
      [2.5, false],
      [1.5, false],
      [0, false],
    ] as const) {
      for (const c of sorted) {
        if (picked.length >= 3) break
        if (picked.some((p) => p.x === c.x && p.y === c.y)) continue
        if (picked.some((p) => Math.hypot(p.x - c.x, p.y - c.y) <= radius)) continue
        if (uniqueZone && picked.some((p) => zoneOf(p.x, p.y) === zoneOf(c.x, c.y))) continue
        picked.push(c)
      }
      if (picked.length >= 3) break
    }
    return picked.slice(0, 3)
  }, [cells])

  const cw = 320 / COLS
  const ch = 96 / ROWS
  const label = `${String(hour).padStart(2, "0")}:00`

  return (
    <div ref={ref}>
      <VizFrame slug="traffic-risk / hourly city grid · LSTM + Prophet" caption="Predicted accident risk surface">
        <svg viewBox="0 0 320 96" className="w-full rounded-md" role="img" aria-label={`Accident risk at ${label}`}>
          {cells.map((c) => (
            <rect
              key={`${c.x}-${c.y}`}
              x={c.x * cw}
              y={c.y * ch}
              width={cw - 1.5}
              height={ch - 1.5}
              rx="2"
              fill={c.v > 0.55 ? "var(--warn)" : "var(--accent)"}
              opacity={0.08 + c.v * 0.85}
              style={{ transition: "opacity 0.55s ease, fill 0.55s ease" }}
            />
          ))}
          {top.map((c, i) => (
            <circle
              key={i}
              cx={c.x * cw + cw / 2 - 0.75}
              cy={c.y * ch + ch / 2 - 0.75}
              r="4.5"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.2"
              opacity="0.75"
              style={{ transition: "cx 0.55s ease, cy 0.55s ease" }}
            />
          ))}
        </svg>

        <div className="mt-4 flex items-end gap-3">
          <button
            type="button"
            onClick={() => {
              touched.current = true
              setPlaying((p) => !p)
            }}
            aria-label={playing ? "Pause hour animation" : "Play hour animation"}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface text-[11px] text-ink-2 transition hover:border-accent hover:text-accent"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <div className="flex-1">
            <Slider
              label="Hour of day"
              value={hour}
              min={0}
              max={23}
              onChange={(v) => {
                setPlaying(false)
                setHour(v)
              }}
              readout={label}
            />
          </div>
        </div>

        <ol className="mt-4 grid gap-1.5">
          {top.map((c, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[10px]"
            >
              <span className="text-muted">#{i + 1}</span>
              <span className="flex-1 truncate text-ink-2">{zoneOf(c.x, c.y)}</span>
              <span className="h-1 w-16 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${Math.round(c.v * 100)}%` }}
                />
              </span>
              <span className="w-8 text-right tabular-nums text-accent">{(c.v * 100).toFixed(0)}</span>
            </li>
          ))}
        </ol>
      </VizFrame>
    </div>
  )
}

export const VISUALS = {
  retail: RetailViz,
  netflix: NetflixViz,
  traffic: TrafficViz,
} as const
