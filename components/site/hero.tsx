"use client"

import { useRef } from "react"
import { asset } from "@/lib/base-path"
import { impact, profile } from "@/lib/content"
import { CountUp } from "./count-up"
import { Reveal } from "./reveal"
import { Rise } from "./rise"

function TiltPhoto() {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 9).toFixed(
      2,
    )}deg) translateZ(0)`
  }

  const reset = () => {
    const el = ref.current
    if (el) el.style.transform = ""
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="relative overflow-hidden rounded-[22px] border border-line bg-surface p-1.5 shadow-[var(--shadow-lg)] transition-transform duration-300 ease-out"
    >
      <img
        src={asset("/nikhil-profile.jpg")}
        alt={profile.name}
        width={520}
        height={640}
        className="h-[300px] w-full rounded-[16px] object-cover object-center sm:h-[380px]"
      />
      <div className="pointer-events-none absolute inset-1.5 rounded-[16px] ring-1 ring-inset ring-black/5" aria-hidden />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-ink-2 backdrop-blur">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-good pulse-dot" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
        </span>
        {profile.location}
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* soft ambient wash — the only decorative motion above the fold */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="drift-blob absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div
          className="drift-blob absolute -right-24 top-24 h-[380px] w-[380px] rounded-full bg-accent-2/10 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
      </div>

      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Rise>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </Rise>

            <Rise delay={80}>
              <h1 className="display mt-7 text-[2.6rem] leading-[1.03] sm:text-6xl lg:text-[4.2rem]">
                {profile.headline.lead}{" "}
                <em className="not-italic">
                  <span className="italic text-accent">{profile.headline.accent}</span>
                </em>
                .
              </h1>
            </Rise>

            <Rise delay={140}>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-2 sm:text-base">{profile.summary}</p>
            </Rise>

            <Rise delay={200}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                <a
                  href="#projects"
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                >
                  See the work
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
                >
                  GitHub
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
                >
                  LinkedIn
                </a>
                <a
                  href={asset(profile.resume)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
                >
                  Résumé ↓
                </a>
              </div>
            </Rise>
          </div>

          <Rise delay={160}>
            <TiltPhoto />
          </Rise>
        </div>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              <span className="eyebrow">Selected impact</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map((item, i) => (
              <Reveal key={item.label} delay={i * 70}>
                <div className="card card-hover h-full p-5">
                  <div className="display text-3xl text-accent">
                    <CountUp value={item.value} prefix={item.prefix} suffix={item.suffix} />
                  </div>
                  <div className="mt-2 text-[13px] font-semibold leading-snug">{item.label}</div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{item.blurb}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
