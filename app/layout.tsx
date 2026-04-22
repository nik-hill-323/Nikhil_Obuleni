import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Nikhil Obuleni | Data Scientist",
  description:
    "Portfolio of Nikhil Obuleni — MS Data Science candidate at George Washington University with 3+ years building ML models, deep learning systems, and ETL pipelines across humanitarian, aerospace, and NLP domains.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <ThemeProvider defaultTheme="dark">
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
