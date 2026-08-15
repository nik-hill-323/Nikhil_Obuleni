"use client"

import { useState } from "react"
import { asset } from "@/lib/base-path"
import { profile } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const links = [
    { label: "GitHub", href: profile.github, sub: "nik-hill-323" },
    { label: "LinkedIn", href: profile.linkedin, sub: "nikhil-obuleni" },
    { label: "Resume, AI Engineer", href: asset(profile.resume), sub: "PDF" },
    { label: "Resume, Data Scientist", href: asset(profile.resumeDs), sub: "PDF" },
  ]

  return (
    <Section
      id="contact"
      n="06"
      label="Contact"
      title="Let's build something useful."
      lede="I am open to AI and ML engineering roles, and happy to talk about retrieval, LLM evaluation, or anything that has to run reliably against real-world data."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <div className="card relative overflow-hidden p-7 md:p-9">
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
              aria-hidden
            />
            <div className="eyebrow">Email</div>
            <a
              href={`mailto:${profile.email}`}
              className="display mt-2 block break-words text-2xl text-ink transition hover:text-accent sm:text-4xl"
            >
              {profile.email}
            </a>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={`mailto:${profile.email}`}
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Send an email
              </a>
              <button
                type="button"
                onClick={copy}
                className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-2 transition hover:border-line-strong hover:text-ink"
              >
                {copied ? "Copied ✓" : "Copy address"}
              </button>
            </div>

            <p className="mt-6 font-mono text-[11px] text-muted">
              {profile.location} · {profile.phone}
            </p>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="card divide-y divide-line overflow-hidden">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-surface-2"
              >
                <span>
                  <span className="block text-sm font-semibold">{l.label}</span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted">{l.sub}</span>
                </span>
                <span className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
