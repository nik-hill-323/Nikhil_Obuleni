"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Linkedin, Send, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      subject: "",
      message: "",
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters"
    }

    if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Message sent successfully!", {
          description: "I'll get back to you as soon as possible!",
          duration: 5000,
        })
        setFormData({ name: "", email: "", subject: "", message: "" })
        setErrors({ name: "", email: "", subject: "", message: "" })
      } else {
        toast.error(data.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-12">
          <div
            className={`text-center space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Get In Touch</h2>
            <div className="h-1 w-20 bg-primary rounded-full mx-auto animate-expand" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I'm currently looking for new opportunities in data science and analytics. Whether you have a question or
              just want to say hi, feel free to reach out!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card
              className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <a href="mailto:nikhil.obuleni@gwu.edu" className="flex items-start gap-4 group">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Email</h3>
                  <p className="text-sm text-muted-foreground">nikhil.obuleni@gwu.edu</p>
                </div>
              </a>
            </Card>

            <Card
              className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <a href="tel:+15714782007" className="flex items-start gap-4 group">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Phone</h3>
                  <p className="text-sm text-muted-foreground">(571) 478-2007</p>
                </div>
              </a>
            </Card>

            <Card
              className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Location</h3>
                  <p className="text-sm text-muted-foreground">Arlington, VA</p>
                </div>
              </div>
            </Card>

            <Card
              className={`p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <a
                href="https://www.linkedin.com/in/nikhil-obuleni"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group"
              >
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Linkedin className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">LinkedIn</h3>
                  <p className="text-sm text-muted-foreground">linkedin.com/in/nikhil-obuleni</p>
                </div>
              </a>
            </Card>
          </div>

          <Card
            className={`p-8 border-primary/20 bg-card/50 backdrop-blur transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`bg-background/50 border-primary/20 focus:border-primary/50 transition-colors ${
                      errors.name ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  {errors.name && <p className="text-xs text-destructive animate-slide-up">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`bg-background/50 border-primary/20 focus:border-primary/50 transition-colors ${
                      errors.email ? "border-destructive focus:border-destructive" : ""
                    }`}
                  />
                  {errors.email && <p className="text-xs text-destructive animate-slide-up">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`bg-background/50 border-primary/20 focus:border-primary/50 transition-colors ${
                    errors.subject ? "border-destructive focus:border-destructive" : ""
                  }`}
                />
                {errors.subject && <p className="text-xs text-destructive animate-slide-up">{errors.subject}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className={`bg-background/50 border-primary/20 focus:border-primary/50 transition-colors resize-none ${
                    errors.message ? "border-destructive focus:border-destructive" : ""
                  }`}
                />
                {errors.message && <p className="text-xs text-destructive animate-slide-up">{errors.message}</p>}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full group hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary via-accent to-secondary animate-gradient hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">© 2025 Nikhil Obuleni. Built with Next.js and Tailwind CSS.</p>
      </footer>
    </section>
  )
}
