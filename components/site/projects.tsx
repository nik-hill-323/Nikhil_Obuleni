"use client"

import { useMemo, useState } from "react"
import { profile, projects } from "@/lib/content"
import { VISUALS } from "./project-visuals"
import { Reveal } from "./reveal"
import { Section } from "./section"

const ORDER = ["Forecasting", "Deep Learning", "Recommenders", "Optimization", "Geospatial"]

export function Projects() {
  const [filter, setFilter] = useState("All")

  const filters = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of projects) for (const c of p.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    const named = ORDER.filter((c) => counts.has(c)).map((c) => ({ label: c, n: counts.get(c)! }))
    return [{ label: "All", n: projects.length }, ...named]
  }, [])

  const shown = filter === "All" ? projects : projects.filter((p) => p.categories.includes(filter))

  return (
    <Section
      id="projects"
      n="03"
      label="Projects"
      title="Things I've actually built."
      lede="Forecasting, recommenders, and geospatial risk — each one is live below, not a screenshot. Drag the sliders, hover the graph: the numbers move the way the models do."
      tint
    >
      <Reveal>
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Filter</span>
          {filters.map((f) => {
            const on = filter === f.label
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => setFilter(f.label)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  on
                    ? "border-accent bg-accent text-white"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
                }`}
              >
                {f.label}
                <span className={`font-mono text-[10px] ${on ? "text-white/70" : "text-muted"}`}>{f.n}</span>
              </button>
            )
          })}
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6">
        {shown.map((p, i) => {
          const Viz = VISUALS[p.id]
          const flip = i % 2 === 1
          return (
            <Reveal key={p.id} delay={i * 90}>
              <article className="card card-hover overflow-hidden">
                <div
                  className={`grid gap-6 p-5 md:grid-cols-2 md:gap-8 md:p-7 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="min-w-0">
                    <Viz />
                  </div>

                  <div className="flex min-w-0 flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-muted">{p.index}</span>
                      {p.categories.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <h3 className="display mt-3 text-2xl sm:text-3xl">
                      {p.name} <span className="italic text-muted">{p.subtitle}</span>
                    </h3>

                    <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{p.blurb}</p>

                    <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-line py-4">
                      {p.results.map((r) => (
                        <div key={r.k}>
                          <dt className="font-mono text-[9px] uppercase tracking-wider text-muted">{r.k}</dt>
                          <dd className="display mt-1 text-xl text-accent">{r.v}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={120}>
        <p className="mt-8 text-center text-sm text-muted">
          More experiments and code on{" "}
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
          >
            GitHub
          </a>
          .
        </p>
      </Reveal>
    </Section>
  )
}
