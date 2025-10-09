import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Projects } from "@/components/projects"
import { Skills } from "@/components/skills"
import { Contact } from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GalaxyBackground } from "@/components/galaxy-background"

export default function Home() {
  return (
    <div className="min-h-screen">
      <GalaxyBackground />
      <Navigation />
      <main>
        <Hero />
        <ScrollReveal>
          <About />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Experience />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Projects />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Skills />
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Contact />
        </ScrollReveal>
      </main>
    </div>
  )
}
