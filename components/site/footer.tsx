import { profile } from "@/lib/content"

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-2 py-10">
      <div className="shell flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-[11px] text-muted">
          © {new Date().getFullYear()} {profile.name} · Built with Next.js & Tailwind
        </p>
        <a href="#top" className="font-mono text-[11px] text-muted transition hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
