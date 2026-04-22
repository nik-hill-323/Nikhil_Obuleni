"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Database, BarChart3, Wrench } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const skillCategories = [
  {
    title: "Languages & ML",
    icon: Code2,
    skills: [
      "Python",
      "R",
      "SQL",
      "scikit-learn",
      "PyTorch",
      "TensorFlow",
      "XGBoost",
      "LightGBM",
      "ARIMA",
      "LSTM",
      "Random Forest",
      "GNN",
      "YOLOv5",
      "Faster R-CNN",
      "Autoencoders",
      "Isolation Forest",
    ],
    color: "primary",
  },
  {
    title: "Data & Visualization",
    icon: BarChart3,
    skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Apache Spark (PySpark)", "Power BI", "Tableau", "Excel"],
    color: "accent",
  },
  {
    title: "NLP, CV & Methods",
    icon: Database,
    skills: [
      "NLP",
      "Computer Vision",
      "Sentiment Analysis",
      "Topic Modeling",
      "Statistical Modeling",
      "Time Series Forecasting",
      "Geospatial Analysis",
    ],
    color: "secondary",
  },
  {
    title: "Cloud & Engineering",
    icon: Wrench,
    skills: [
      "ETL Pipelines",
      "Apache Airflow",
      "BigQuery",
      "AWS (EC2, Lambda, S3)",
      "Salesforce CRM",
      "Salesforce Flow",
      "MongoDB",
      "Docker",
      "Git",
      "REST APIs",
      "GIS",
      "LiDAR",
    ],
    color: "primary",
  },
]

export function Skills() {
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
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30" ref={sectionRef}>
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          <div
            className={`space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Skills & Technologies</h2>
            <div className="h-1 w-20 bg-primary rounded-full animate-expand" />
            <p className="text-lg text-muted-foreground max-w-2xl">
              A comprehensive toolkit for building scalable data solutions and delivering actionable insights.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {skillCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <Card
                  key={index}
                  className={`p-6 border-${category.color}/20 bg-card/50 backdrop-blur hover:border-${category.color}/40 hover:scale-[1.02] hover:shadow-lg hover:shadow-${category.color}/10 transition-all duration-500 group ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 bg-${category.color}/10 rounded-lg group-hover:bg-${category.color}/20 group-hover:scale-110 transition-all duration-300`}
                      >
                        <Icon className={`h-6 w-6 text-${category.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-${category.color} transition-colors">
                        {category.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-sm hover:scale-110 hover:bg-${category.color}/20 transition-all duration-300"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
