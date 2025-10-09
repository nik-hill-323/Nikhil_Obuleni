"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "./theme-provider"

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Star class
    class Star {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      twinkleSpeed: number
      twinklePhase: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2
        this.speedX = (Math.random() - 0.5) * 0.1
        this.speedY = (Math.random() - 0.5) * 0.1
        this.opacity = Math.random()
        this.twinkleSpeed = Math.random() * 0.02 + 0.01
        this.twinklePhase = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        // Twinkle effect
        this.twinklePhase += this.twinkleSpeed
        this.opacity = 0.3 + Math.sin(this.twinklePhase) * 0.7
      }

      draw(isDark: boolean) {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${isDark ? 255 : 100}, ${isDark ? 255 : 100}, ${isDark ? 255 : 150}, ${isDark ? this.opacity : this.opacity * 0.6})`
        ctx.fill()
      }
    }

    // Shooting star class
    class ShootingStar {
      x: number
      y: number
      length: number
      speed: number
      opacity: number
      angle: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height * 0.5
        this.length = Math.random() * 80 + 40
        this.speed = Math.random() * 10 + 10
        this.opacity = 1
        this.angle = Math.PI / 4
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed
        this.y += Math.sin(this.angle) * this.speed
        this.opacity -= 0.01
      }

      draw(isDark: boolean) {
        if (!ctx) return
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)

        const gradient = ctx.createLinearGradient(0, 0, this.length, 0)
        if (isDark) {
          gradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.opacity})`)
          gradient.addColorStop(1, `rgba(100, 200, 255, ${this.opacity})`)
        } else {
          gradient.addColorStop(0, `rgba(100, 100, 200, 0)`)
          gradient.addColorStop(0.5, `rgba(100, 100, 200, ${this.opacity * 0.7})`)
          gradient.addColorStop(1, `rgba(50, 150, 255, ${this.opacity * 0.7})`)
        }

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.length, 0)
        ctx.stroke()
        ctx.restore()
      }

      isFinished() {
        return this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height
      }
    }

    // Create stars
    const stars: Star[] = []
    for (let i = 0; i < 200; i++) {
      stars.push(new Star())
    }

    // Shooting stars array
    const shootingStars: ShootingStar[] = []

    // Animation loop
    let animationId: number
    const animate = () => {
      if (!ctx) return

      const isDark = theme === "dark"

      if (isDark) {
        // Dark mode: deep space colors
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
        )
        gradient.addColorStop(0, "rgba(15, 23, 42, 1)")
        gradient.addColorStop(0.5, "rgba(30, 41, 59, 1)")
        gradient.addColorStop(1, "rgba(15, 23, 42, 1)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add nebula clouds for dark mode
        ctx.globalCompositeOperation = "lighter"

        // Purple nebula
        const nebulaGradient1 = ctx.createRadialGradient(
          canvas.width * 0.3,
          canvas.height * 0.4,
          0,
          canvas.width * 0.3,
          canvas.height * 0.4,
          canvas.width * 0.4,
        )
        nebulaGradient1.addColorStop(0, "rgba(139, 92, 246, 0.1)")
        nebulaGradient1.addColorStop(0.5, "rgba(139, 92, 246, 0.05)")
        nebulaGradient1.addColorStop(1, "rgba(139, 92, 246, 0)")
        ctx.fillStyle = nebulaGradient1
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Cyan nebula
        const nebulaGradient2 = ctx.createRadialGradient(
          canvas.width * 0.7,
          canvas.height * 0.6,
          0,
          canvas.width * 0.7,
          canvas.height * 0.6,
          canvas.width * 0.3,
        )
        nebulaGradient2.addColorStop(0, "rgba(34, 211, 238, 0.08)")
        nebulaGradient2.addColorStop(0.5, "rgba(34, 211, 238, 0.04)")
        nebulaGradient2.addColorStop(1, "rgba(34, 211, 238, 0)")
        ctx.fillStyle = nebulaGradient2
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalCompositeOperation = "source-over"
      } else {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
        )
        gradient.addColorStop(0, "rgba(230, 235, 255, 1)")
        gradient.addColorStop(0.5, "rgba(220, 230, 255, 1)")
        gradient.addColorStop(1, "rgba(200, 220, 255, 1)")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalCompositeOperation = "multiply"

        // Purple nebula for light mode
        const nebulaGradient1 = ctx.createRadialGradient(
          canvas.width * 0.3,
          canvas.height * 0.4,
          0,
          canvas.width * 0.3,
          canvas.height * 0.4,
          canvas.width * 0.4,
        )
        nebulaGradient1.addColorStop(0, "rgba(180, 150, 255, 0.15)")
        nebulaGradient1.addColorStop(0.5, "rgba(180, 150, 255, 0.08)")
        nebulaGradient1.addColorStop(1, "rgba(180, 150, 255, 0)")
        ctx.fillStyle = nebulaGradient1
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Cyan nebula for light mode
        const nebulaGradient2 = ctx.createRadialGradient(
          canvas.width * 0.7,
          canvas.height * 0.6,
          0,
          canvas.width * 0.7,
          canvas.height * 0.6,
          canvas.width * 0.3,
        )
        nebulaGradient2.addColorStop(0, "rgba(100, 200, 255, 0.12)")
        nebulaGradient2.addColorStop(0.5, "rgba(100, 200, 255, 0.06)")
        nebulaGradient2.addColorStop(1, "rgba(100, 200, 255, 0)")
        ctx.fillStyle = nebulaGradient2
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.globalCompositeOperation = "source-over"
      }

      // Update and draw stars
      stars.forEach((star) => {
        star.update()
        star.draw(isDark)
      })

      // Randomly create shooting stars
      if (Math.random() < 0.01) {
        shootingStars.push(new ShootingStar())
      }

      // Update and draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        shootingStars[i].update()
        shootingStars[i].draw(isDark)

        if (shootingStars[i].isFinished()) {
          shootingStars.splice(i, 1)
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
      cancelAnimationFrame(animationId)
    }
  }, [theme])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />
}
