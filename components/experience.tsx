"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const experiences = [
  {
    title: "Healthcare Data Analyst",
    company: "Apollo Hospitals",
    location: "Bangalore, India",
    period: "Mar 2024 - Aug 2024",
    achievements: [
      "Reduced appointment delays by 15% through end-to-end analysis of patient flow and hospital operations",
      "Improved decision-making speed by 25% with interactive Power BI dashboards monitoring 15+ KPIs",
      "Reduced manual reporting efforts by 30% by automating ETL pipelines with Python and SQL",
      "Enhanced resource allocation with predictive analytics models for patient inflow forecasting",
    ],
    skills: ["Python", "SQL", "Power BI", "ETL", "Predictive Analytics"],
    color: "primary",
  },
  {
    title: "Data Science Intern",
    company: "Asteria Aerospace",
    location: "Bangalore, India",
    period: "Jun 2023 - Aug 2023",
    achievements: [
      "Enhanced surveillance efficiency by 30% with AI-driven computer vision models (YOLOv5, Faster R-CNN)",
      "Reduced unexpected drone breakdowns by 25% using predictive maintenance models (LSTMs, Random Forest)",
      "Improved drone navigation accuracy by 20% through geospatial data analysis using GIS and LiDAR",
      "Improved fault detection by 40% with anomaly detection system using Autoencoders",
    ],
    skills: ["Computer Vision", "Deep Learning", "GIS", "LSTMs", "YOLOv5"],
    color: "accent",
  },
  {
    title: "Data Science Intern",
    company: "Blackoffer",
    location: "Remote",
    period: "Sept 2022 - Nov 2022",
    achievements: [
      "Automated data collection from 50,000+ text records using Python web scraping tools",
      "Improved client campaign targeting by 18% through advanced NLP techniques",
      "Reduced manual efforts by 40% by optimizing data pipelines",
      "Enhanced data-driven insights with machine learning models for text classification",
    ],
    skills: ["NLP", "Web Scraping", "Python", "Machine Learning", "Text Analytics"],
    color: "secondary",
  },
]

export function Experience() {
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
    <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" ref={sectionRef}>
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          <div
            className={`space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Professional Experience</h2>
            <div className="h-1 w-20 bg-primary rounded-full animate-expand" />
          </div>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <Card
                key={index}
                className={`p-6 sm:p-8 border-${exp.color}/20 bg-card/50 backdrop-blur hover:border-${exp.color}/40 hover:scale-[1.01] hover:shadow-xl transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${exp.color}/10 rounded-lg hover:bg-${exp.color}/20 transition-colors`}>
                          <Briefcase className={`h-5 w-5 text-${exp.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{exp.title}</h3>
                          <p className="text-muted-foreground">
                            {exp.company} • {exp.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit hover:scale-105 transition-transform">
                      {exp.period}
                    </Badge>
                  </div>

                  <ul className="space-y-3">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start gap-3 group/item">
                        <TrendingUp
                          className={`h-5 w-5 text-${exp.color} mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform`}
                        />
                        <span className="text-muted-foreground leading-relaxed">{achievement}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {exp.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs hover:scale-105 transition-transform">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
