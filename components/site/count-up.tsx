"use client"

import { useEffect, useState } from "react"
import { useInView } from "./reveal"

type CountUpProps = {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

/** Counts from zero to `value` the first time it scrolls into view. */
export function CountUp({ value, prefix = "", suffix = "", duration = 1400 }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return

    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduce) {
      setN(value)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out-expo keeps the last digits from crawling
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setN(Math.round(value * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  )
}
