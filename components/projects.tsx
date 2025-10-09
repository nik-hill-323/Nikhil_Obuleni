"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const projects = [
  {
    title: "Retail Demand Forecasting & Price Optimization",
    description:
      "Built an end-to-end demand forecasting system leveraging PySpark and XGBoost for a multi-store retail chain.",
    achievements: [
      "93% accuracy in demand forecasting",
      "Reduced stockouts by 35%",
      "Enhanced revenue by 15%",
      "Improved profitability by 12% with automated markdown optimization",
    ],
    technologies: ["PySpark", "XGBoost", "Python", "Machine Learning", "Optimization"],
    impact: "$100M+ revenue impact",
  },
  {
    title: "Netflix Content Recommendation & Churn Prediction",
    description:
      "Created a content recommendation engine using Graph Neural Networks and Collaborative Filtering, analyzing 10M+ viewer records.",
    achievements: [
      "Boosted engagement by 35%",
      "92% churn prediction accuracy",
      "Reduced subscription churn by 20%",
      "Enabled data-driven retention strategies",
    ],
    technologies: ["GNN", "Deep Learning", "LSTMs", "XGBoost", "Collaborative Filtering"],
    impact: "$100M+ revenue impact",
  },
  {
    title: "Real-Time Traffic Accident Prediction",
    description:
      "Applied time-series forecasting models to predict traffic congestion patterns and accident frequency across different time intervals.",
    achievements: [
      "Processed millions of real-time accident records",
      "Identified high-risk accident hotspots",
      "Predicted traffic congestion patterns",
      "Enabled proactive traffic management",
    ],
    technologies: ["LSTM", "Prophet", "GIS", "Python", "Folium", "Time-Series Analysis"],
    impact: "Public safety enhancement",
  },
  {
    title: "Customer Churn Analysis - Telecom Sector",
    description:
      "Analyzed customer behavior and service usage data to identify key churn drivers and develop retention strategies.",
    achievements: [
      "90%+ churn prediction accuracy",
      "Reduced potential churn by 18%",
      "Segmented high-value retention groups",
      "Quantified revenue loss from churned customers",
    ],
    technologies: ["Logistic Regression", "Random Forest", "K-Means", "Power BI", "CLV Analysis"],
    impact: "Revenue retention",
  },
]

export function Projects() {
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
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          <div
            className={`space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Featured Projects</h2>
            <div className="h-1 w-20 bg-primary rounded-full animate-expand" />
            <p className="text-lg text-muted-foreground max-w-2xl">
              A selection of projects demonstrating my expertise in machine learning, predictive analytics, and
              data-driven decision making.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Card
                key={index}
                className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Key Achievements:</p>
                    <ul className="space-y-1.5">
                      {project.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2 group/item">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                          <span className="text-sm text-muted-foreground">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="outline" className="border-accent text-accent hover:bg-accent/10 transition-colors">
                      {project.impact}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs hover:scale-105 transition-transform">
                        {tech}
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
