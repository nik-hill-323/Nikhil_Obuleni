"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const experiences = [
  {
    title: "Student Data & Systems Analyst",
    company: "GW Libraries & Academic Innovation",
    location: "Washington, DC",
    period: "Aug 2025 - Present",
    achievements: [
      "Manage operational records in Salesforce CRM for facility access and maintenance ticket lifecycles across 500+ weekly entries",
      "Built custom Salesforce reports and dashboards for space utilization KPIs; automated workflows via Salesforce Flow, reducing manual entry time by 30%",
      "Improved reporting turnaround from weekly to daily by automating cross-system data pipelines",
      "Reconciled structured data across Salesforce and building management systems, resolving 200+ data discrepancies",
    ],
    skills: ["Salesforce CRM", "Salesforce Flow", "SQL", "Data Quality", "Dashboards"],
    color: "primary",
  },
  {
    title: "Data Science Consultant",
    company: "Data Science for Sustainable Development",
    location: "Washington, DC",
    period: "Feb 2025 - Dec 2026",
    achievements: [
      "Built ARIMA + LSTM + XGBoost ensemble on 200K+ humanitarian records spanning 18 countries, achieving 78% weighted F1 on disaster impact forecasting",
      "Standardized data sharing across 6 NGO partners using Apache Airflow DAGs on BigQuery, cutting integration time from 14 days to 48 hours",
      "Enabled near real-time reporting for humanitarian operations with multi-country pipelines",
      "Designed interpretable evaluation metrics aligned with field deployment constraints for non-technical stakeholders",
    ],
    skills: ["ARIMA", "LSTM", "XGBoost", "Apache Airflow", "BigQuery", "Python"],
    color: "accent",
  },
  {
    title: "Data Science Intern",
    company: "Asteria Aerospace",
    location: "Bangalore, India",
    period: "May 2023 - Aug 2023",
    achievements: [
      "Engineered YOLOv5 and Faster R-CNN computer vision models for real-time drone object detection, improving surveillance efficiency by 30%",
      "Deployed predictive maintenance using LSTMs and Random Forest, reducing unexpected drone breakdowns by 25%",
      "Built anomaly detection with Autoencoders and Isolation Forest, improving fault detection by 40%",
      "Improved drone navigation accuracy by 20% through geospatial analysis using GIS, LiDAR, and satellite imagery",
    ],
    skills: ["YOLOv5", "Faster R-CNN", "LSTMs", "GIS", "LiDAR", "Autoencoders"],
    color: "secondary",
  },
  {
    title: "Data Science Intern",
    company: "Blackoffer",
    location: "Remote",
    period: "Sep 2022 - Nov 2022",
    achievements: [
      "Applied NLP techniques (sentiment analysis, keyword extraction, topic modeling) on 50,000+ text records, improving client campaign targeting by 18%",
      "Automated web scraping pipelines with BeautifulSoup and Scrapy, reducing processing time by 40%",
      "Engineered ML models for text classification and clustering across multiple client projects",
      "Optimized ETL pipelines to ensure data quality and analytical efficiency",
    ],
    skills: ["NLP", "BeautifulSoup", "Scrapy", "Python", "Topic Modeling"],
    color: "primary",
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
