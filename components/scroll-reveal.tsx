"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: "up" | "down" | "left" | "right"
}

export function ScrollReveal({ children, delay = 0, className = "", direction = "up" }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay)
          }
        })
      },
      { threshold: 0.1 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0"
    switch (direction) {
      case "up":
        return "translate-y-16"
      case "down":
        return "-translate-y-16"
      case "left":
        return "translate-x-16"
      case "right":
        return "-translate-x-16"
      default:
        return "translate-y-16"
    }
  }

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ${
        isVisible ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-95"
      } ${getTransform()} ${className}`}
    >
      {children}
    </div>
  )
}
