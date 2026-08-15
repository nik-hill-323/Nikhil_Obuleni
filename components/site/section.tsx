import type { ReactNode } from "react"
import { Reveal } from "./reveal"

type SectionProps = {
  id: string
  n: string
  label: string
  title: string
  lede?: string
  children: ReactNode
  tint?: boolean
}

export function Section({ id, n, label, title, lede, children, tint = false }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 md:py-28 ${tint ? "bg-bg-2" : ""}`}>
      <div className="shell">
        <Reveal>
          <div className="flex items-center gap-2.5">
            <span className="eyebrow text-accent">{n}</span>
            <span className="eyebrow">· {label}</span>
            <span className="h-px flex-1 bg-line" aria-hidden />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="display mt-5 text-4xl sm:text-5xl">{title}</h2>
        </Reveal>

        {lede && (
          <Reveal delay={100}>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">{lede}</p>
          </Reveal>
        )}

        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  )
}
