"use client"

import { useState } from "react"
import { jobs } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

export function Experience() {
  const [active, setActive] = useState(0)
  const job = jobs[active]

  const move = (delta: number) => setActive((i) => (i + delta + jobs.length) % jobs.length)

  return (
    <Section
      id="experience"
      n="03"
      label="Experience"
      title="Experience"
      lede="LLM systems for global mental health research, ML and data engineering for humanitarian reporting, and computer vision for drone platforms."
    >
      {/* timeline rail */}
      <Reveal>
        <div className="relative">
          <div className="absolute left-0 right-0 top-[19px] hidden h-px bg-line md:block" aria-hidden />
          <ol className="grid gap-2 md:grid-cols-4 md:gap-4">
            {jobs.map((j, i) => {
              const on = i === active
              return (
                <li key={j.title + j.org} className="relative">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={on}
                    className="group flex w-full items-center gap-3 text-left md:block"
                  >
                    <span
                      className={`relative z-10 grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border-2 bg-bg font-mono text-[11px] transition-all duration-300 ${
                        on
                          ? "border-accent text-accent shadow-[0_0_0_5px_var(--accent-soft)]"
                          : "border-line text-muted group-hover:border-line-strong group-hover:text-ink-2"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="md:mt-4 md:block">
                      <span
                        className={`block text-[13px] font-semibold leading-tight transition-colors ${
                          on ? "text-ink" : "text-muted group-hover:text-ink-2"
                        }`}
                      >
                        {j.org}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-muted">
                        {j.period}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </Reveal>

      {/* detail */}
      <Reveal delay={80}>
        <div className="card mt-10 overflow-hidden">
          <div key={active} className="animate-[rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both] p-6 md:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                {job.kind}
              </span>
              <span className="font-mono text-[11px] text-muted">{job.period}</span>
              <span className="font-mono text-[11px] text-muted">· {job.place}</span>
            </div>

            <h3 className="display mt-4 text-2xl sm:text-3xl">{job.title}</h3>
            <p className="mt-1 text-sm font-medium text-accent">{job.org}</p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{job.blurb}</p>

            <ul className="mt-6 space-y-3 border-t border-line pt-6">
              {job.points.map((p, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-2">
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {job.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-surface-2 px-6 py-3">
            <span className="eyebrow">
              {String(active + 1).padStart(2, "0")} / {String(jobs.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous role"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-accent"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next role"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-accent hover:text-accent"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
