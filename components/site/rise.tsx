import type { ReactNode } from "react"

/**
 * Above-the-fold entrance. Pure CSS, so it plays on first paint instead of
 * waiting for hydration — the hero must never be a blank screen.
 */
export function Rise({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div className={`rise-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
