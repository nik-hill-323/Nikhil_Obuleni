"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "li" | "section" | "article"
}

/** Fades + lifts its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    // @ts-expect-error -- polymorphic tag with a shared ref type
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/** Returns true once the element has been scrolled into view — used to start canvas/SVG animations lazily. */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      }
    }, options ?? { threshold: 0.25 })

    io.observe(el)
    return () => io.disconnect()
  }, [options])

  return { ref, inView }
}
