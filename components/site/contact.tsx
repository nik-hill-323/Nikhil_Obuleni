"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { asset } from "@/lib/base-path"
import { profile } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

const SUBJECT = "Hello from your portfolio"
const BODY = "Hi Nikhil,"

const MAILTO = `mailto:${profile.email}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`

/** Webmail compose URLs, for visitors with no desktop mail client registered. */
const WEBMAIL = [
  {
    label: "Gmail",
    href:
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(profile.email)}` +
      `&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`,
  },
  {
    label: "Outlook",
    href:
      "https://outlook.live.com/mail/0/deeplink/compose" +
      `?to=${encodeURIComponent(profile.email)}` +
      `&subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`,
  },
]

/** Clipboard write with a fallback for browsers that block the async API. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement("textarea")
      el.value = text
      el.setAttribute("readonly", "")
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [showWebmail, setShowWebmail] = useState(false)
  const timer = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  // A mailto: link does nothing at all when no mail client is registered, and
  // the browser gives no error. If the page never loses focus after the click,
  // nothing opened, so offer webmail instead.
  useEffect(() => {
    const cancel = () => clearTimer()
    window.addEventListener("blur", cancel)
    document.addEventListener("visibilitychange", cancel)
    return () => {
      window.removeEventListener("blur", cancel)
      document.removeEventListener("visibilitychange", cancel)
      clearTimer()
    }
  }, [clearTimer])

  const onMailtoClick = () => {
    clearTimer()
    timer.current = window.setTimeout(() => setShowWebmail(true), 800)
  }

  const copy = async () => {
    const ok = await copyText(profile.email)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } else {
      setShowWebmail(true)
    }
  }

  const links = [
    { label: "GitHub", href: profile.github, sub: "nik-hill-323" },
    { label: "LinkedIn", href: profile.linkedin, sub: "nikhil-obuleni" },
    { label: "Resume", href: asset(profile.resume), sub: "PDF, one page" },
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
              href={MAILTO}
              onClick={onMailtoClick}
              className="display mt-2 block break-words text-2xl text-ink transition hover:text-accent sm:text-4xl"
            >
              {profile.email}
            </a>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={MAILTO}
                onClick={onMailtoClick}
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

            {showWebmail && (
              <div className="mt-5 rounded-xl border border-line bg-surface-2 p-4">
                <p className="text-[13px] text-ink-2">
                  No mail app opened. Compose in the browser instead:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {WEBMAIL.map((w) => (
                    <a
                      key={w.label}
                      href={w.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-accent hover:text-accent"
                    >
                      {w.label}
                    </a>
                  ))}
                  <button
                    type="button"
                    onClick={copy}
                    className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-accent hover:text-accent"
                  >
                    {copied ? "Copied ✓" : "Copy address"}
                  </button>
                </div>
              </div>
            )}

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
