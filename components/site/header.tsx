"use client"

import { useEffect, useState } from "react"
import { profile, sections } from "@/lib/content"

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
    setReady(true)
  }, [])

  const toggle = () => {
    // Read the live class rather than React state so back-to-back clicks
    // inside one render pass can't get out of step with the document.
    const next = !document.documentElement.classList.contains("dark")
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:border-line-strong hover:text-accent"
    >
      <span className={ready ? "" : "opacity-0"} aria-hidden>
        {dark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  )
}

export function Header() {
  const [progress, setProgress] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      setScrolled(window.scrollY > 24)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (!targets.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    )

    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-colors duration-300 ${
          scrolled ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <a href="#top" className="group flex items-center gap-2.5" aria-label={`${profile.name}, back to top`}>
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-accent text-[11px] font-semibold tracking-wide text-white shadow-sm transition group-hover:scale-105">
              {profile.monogram}
            </span>
            <span className="text-sm font-semibold tracking-tight">{profile.name}</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  active === s.id ? "text-accent" : "text-muted hover:text-ink"
                }`}
              >
                {active === s.id && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-accent-soft" aria-hidden />
                )}
                {s.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="shell grid gap-1 border-t border-line pb-4 pt-3 md:hidden">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 transition hover:bg-surface-2"
              >
                <span className="font-mono text-[10px] text-muted">{s.n}</span>
                {s.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div
        className="h-[2px] origin-left bg-gradient-to-r from-accent to-accent-2 transition-[transform] duration-150"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden
      />
    </header>
  )
}
