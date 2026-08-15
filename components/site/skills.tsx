"use client"

import { useState } from "react"
import { skills } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

export function Skills() {
  const [q, setQ] = useState("")
  const needle = q.trim().toLowerCase()

  const total = skills.reduce((n, g) => n + g.items.length, 0)
  const matches = needle
    ? skills.reduce((n, g) => n + g.items.filter((i) => i.toLowerCase().includes(needle)).length, 0)
    : total

  return (
    <Section
      id="skills"
      n="04"
      label="Skills"
      title="What I reach for."
      lede="The stack behind the work above — grouped by the job it does, not by how impressive it looks in a list."
    >
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter — try “LSTM” or “AWS”"
              aria-label="Filter skills"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent"
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <span className="font-mono text-[11px] text-muted">
            {matches} / {total} matching
          </span>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {skills.map((group, gi) => {
          const hits = needle ? group.items.filter((i) => i.toLowerCase().includes(needle)).length : group.items.length
          return (
            <Reveal key={group.title} delay={gi * 70}>
              <div
                className={`card card-hover h-full p-6 transition-opacity ${
                  needle && hits === 0 ? "opacity-40" : "opacity-100"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold">{group.title}</h3>
                  <span className="font-mono text-[10px] text-muted">{group.items.length}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{group.blurb}</p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const hit = needle.length > 0 && item.toLowerCase().includes(needle)
                    return (
                      <span
                        key={item}
                        className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-all duration-200 ${
                          hit
                            ? "border-accent bg-accent text-white"
                            : needle
                              ? "border-line bg-surface-2 text-muted opacity-50"
                              : "border-line bg-surface-2 text-ink-2 hover:border-accent hover:text-accent"
                        }`}
                      >
                        {item}
                      </span>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
