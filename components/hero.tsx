"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { Scene3D } from "./3d-scene"

export function Hero() {
  const [mounted, setMounted] = useState(false)
  const [displayedName, setDisplayedName] = useState("")
  const fullName = "Nikhil Obuleni"

  useEffect(() => {
    setMounted(true)

    // Typing animation for name
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullName.length) {
        setDisplayedName(fullName.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 dark:opacity-30">
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p
                className={`text-primary font-mono text-sm sm:text-base transition-all duration-1000 ${
                  mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                Hi, my name is
              </p>
              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground transition-all duration-1000 ${
                  mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                {displayedName}
                <span className="animate-pulse-glow text-primary">|</span>
              </h1>
              <h2
                className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-gradient transition-all duration-1000 ${
                  mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                Turning data into stories that drive decisions.
              </h2>
            </div>

            <p
              className={`text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed transition-all duration-1000 ${
                mounted ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-sm"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              I'm a Data Scientist specializing in{" "}
              <span className="text-primary font-semibold">healthcare analytics</span>,{" "}
              <span className="text-accent font-semibold">machine learning</span>, and{" "}
              <span className="text-secondary font-semibold">predictive modeling</span>. Currently pursuing my MS in
              Data Science at George Washington University.
            </p>

            <div
              className={`flex flex-wrap items-center gap-4 transition-all duration-1000 ${
                mounted ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-sm"
              }`}
              style={{ transitionDelay: "800ms" }}
            >
              <Button
                size="lg"
                className="group hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/50 bg-gradient-to-r from-primary via-accent to-secondary animate-gradient hover-glow"
                asChild
              >
                <a href="#contact">
                  Get In Touch
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:scale-110 transition-all duration-300 bg-transparent hover:bg-primary/10 hover:shadow-xl"
                asChild
              >
                <a href="#projects">View My Work</a>
              </Button>
            </div>

            <div
              className={`flex items-center gap-6 pt-4 transition-all duration-1000 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "1000ms" }}
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125 hover:-translate-y-2"
              >
                <Github className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/nikhil-obuleni"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125 hover:-translate-y-2"
              >
                <Linkedin className="h-6 w-6" />
              </a>
              <a
                href="mailto:nikhil.obuleni@gwu.edu"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-125 hover:-translate-y-2"
              >
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 ${
              mounted ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="relative group">
              {/* Animated border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow" />

              {/* Photo container - now circular and smaller */}
              <div className="relative aspect-square max-w-xs mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full transform group-hover:scale-105 transition-transform duration-500" />
                <div className="relative h-full w-full rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-500">
                  <img
                    src={`${process.env.NODE_ENV === 'production' ? '/mass123' : ''}/nikhil-profile.jpg`}
                    alt="Nikhil Obuleni"
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    loading="eager"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                </div>
              </div>

              {/* Floating data points decoration */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
              <div
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-pulse-slow"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "1200ms" }}
      >
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">Scroll</span>
        </div>
      </div>
    </section>
  )
}
