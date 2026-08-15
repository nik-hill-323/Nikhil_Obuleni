import { About } from "@/components/site/about"
import { Contact } from "@/components/site/contact"
import { Education } from "@/components/site/education"
import { Experience } from "@/components/site/experience"
import { Footer } from "@/components/site/footer"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { Projects } from "@/components/site/projects"
import { Skills } from "@/components/site/skills"

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
