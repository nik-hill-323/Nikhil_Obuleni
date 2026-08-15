import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-code",
  display: "swap",
})

const SITE = "https://nik-hill-323.github.io/Nikhil_Obuleni"
const DESCRIPTION =
  "AI Engineer building production-grade AI systems. LLM agent pipelines, RAG and retrieval infrastructure, model evaluation, and data engineering. AI Research Engineer at GW's Center for Global Mental Health Equity."

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Nikhil Obuleni | AI Engineer & Data Scientist",
  description: DESCRIPTION,
  keywords: [
    "AI Engineer",
    "AI Research Engineer",
    "Machine Learning Engineer",
    "LLM",
    "RAG",
    "Retrieval Augmented Generation",
    "LLM Evaluation",
    "Data Engineering",
    "Nikhil Obuleni",
  ],
  authors: [{ name: "Nikhil Obuleni", url: SITE }],
  creator: "Nikhil Obuleni",
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Nikhil Obuleni",
    title: "Nikhil Obuleni | AI Engineer & Data Scientist",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Nikhil Obuleni, AI Engineer building production-grade AI systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nikhil Obuleni | AI Engineer & Data Scientist",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nikhil Obuleni",
  jobTitle: "AI Engineer",
  url: SITE,
  email: "mailto:nikhil.obuleni@gwu.edu",
  address: { "@type": "PostalAddress", addressLocality: "Washington", addressRegion: "DC" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "George Washington University" },
  sameAs: ["https://github.com/nik-hill-323", "https://www.linkedin.com/in/nikhil-obuleni"],
  knowsAbout: [
    "Artificial Intelligence",
    "Large Language Models",
    "Retrieval Augmented Generation",
    "Machine Learning",
    "Data Engineering",
  ],
}

// Applied before paint so a dark-mode visitor never sees a white flash.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </head>
      <body
        className={`${inter.variable} ${display.variable} ${mono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
