import { education } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

export function Education() {
  return (
    <Section
      id="education"
      n="05"
      label="Education"
      title="Education"
      lede="Coursework behind the applied work, and the fellowship that funded it."
      tint
    >
      <div className="grid gap-4">
        {education.map((e, i) => (
          <Reveal key={e.degree} delay={i * 80}>
            <div className="card card-hover p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="display text-2xl sm:text-3xl">{e.degree}</h3>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{e.period}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-accent">{e.school}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{e.detail}</p>

              <div className="mt-6 border-t border-line pt-5">
                <div className="eyebrow">Coursework</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.coursework.map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] text-ink-2"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
