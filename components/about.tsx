"use client"

import { Card } from "@/components/ui/card"
import { GraduationCap, MapPin } from "lucide-react"
import { useEffect, useRef, useState, Suspense } from "react"
import { DataViz3D } from "./3d-data-viz"

export function About() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative" ref={sectionRef}>
      <div className="absolute right-0 top-1/4 w-1/3 h-64 opacity-20 dark:opacity-10 pointer-events-none hidden lg:block">
        <Suspense fallback={null}>
          <DataViz3D />
        </Suspense>
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          <div
            className={`space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">About Me</h2>
            <div className="h-1 w-20 bg-primary rounded-full animate-expand" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p
                className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                I'm a Data Scientist with 3+ years of experience building machine learning models, deep learning
                systems, and ETL pipelines across humanitarian, aerospace, and NLP domains. I specialize in turning
                complex, multi-source data into interpretable insights and production-ready systems.
              </p>
              <p
                className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                Across roles at{" "}
                <span className="text-primary font-semibold">Data Science for Sustainable Development</span>,{" "}
                <span className="text-accent font-semibold">Asteria Aerospace</span>, and{" "}
                <span className="text-secondary font-semibold">Blackoffer</span>, I've delivered forecasting
                ensembles on humanitarian datasets, real-time computer vision models for drones, and NLP pipelines
                that improved client campaign targeting.
              </p>
              <p
                className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                I'm currently pursuing my MS in Data Science at George Washington University (GPA 3.75, CCAS Global
                Leaders Fellow), with a focus on machine learning, NLP, and scalable data systems.
              </p>
            </div>

            <div className="space-y-6">
              <Card
                className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Education</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-foreground">MS in Data Science</p>
                        <p className="text-sm text-muted-foreground">George Washington University</p>
                        <p className="text-xs text-muted-foreground">Jan 2025 - Present • GPA 3.75</p>
                        <p className="text-xs text-muted-foreground">
                          CCAS Global Leaders Fellowship ($17,100, 2025)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-6 border-accent/20 bg-card/50 backdrop-blur hover:border-accent/50 hover:scale-105 hover:shadow-lg hover:shadow-accent/10 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Location</h3>
                    <p className="text-muted-foreground">Washington, DC</p>
                    <p className="text-sm text-muted-foreground">
                      Open to opportunities in the DMV area and remote positions
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
