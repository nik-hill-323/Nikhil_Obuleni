import { about } from "@/lib/content"
import { Reveal } from "./reveal"
import { Section } from "./section"

export function About() {
  return (
    <Section id="about" n="01" label="About" title="Who I am, in a nutshell." tint>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-14">
        <div className="space-y-5">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <p className="text-[15px] leading-[1.75] text-ink-2 sm:text-base">{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <dl className="card divide-y divide-line overflow-hidden">
            {about.facts.map((f) => (
              <div key={f.k} className="flex flex-col gap-1 px-5 py-4">
                <dt className="eyebrow">{f.k}</dt>
                <dd className="text-sm font-medium text-ink">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  )
}
