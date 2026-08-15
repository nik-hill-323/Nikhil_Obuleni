# Nikhil Obuleni — Portfolio

Personal site for Nikhil Obuleni, M.S. Data Science candidate at the George Washington University.
Live at **https://nik-hill-323.github.io/Nikhil_Obuleni/**

## Stack

- Next.js 15 (App Router, `output: 'export'` → static HTML)
- Tailwind CSS v4
- No runtime dependencies beyond React — every visualization is hand-written SVG

## Structure

```
app/
  layout.tsx      fonts, metadata, pre-paint theme script
  page.tsx        section order
  globals.css     design tokens (light + dark), motion primitives
components/site/
  header.tsx           sticky nav, scroll progress, active section, theme toggle
  hero.tsx             headline, tilt photo, animated impact counters
  about.tsx
  experience.tsx       clickable role timeline
  projects.tsx         category filter + project cards
  project-visuals.tsx  the three interactive visualizations
  skills.tsx           live skill filter
  education.tsx
  contact.tsx
  reveal.tsx / rise.tsx / count-up.tsx / section.tsx
lib/
  content.ts      ALL site copy lives here — edit this, not the components
  base-path.ts    GitHub Pages sub-path prefix for static assets
```

### Editing content

Everything on the page — headline, roles, bullet points, project copy, metrics,
skills, links — comes from `lib/content.ts`. Changing text never requires
touching a component.

The project visualizations are driven by data at the top of
`components/site/project-visuals.tsx`: `WEEKS_ACTUAL` / `BASE_FORECAST` for the
retail chart, `NODES` / `EDGES` for the recommendation graph, and the `risk()`
hotspot centres for the traffic grid.

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
`next build` and publishes `out/` to GitHub Pages. `next.config.mjs` sets
`basePath: '/Nikhil_Obuleni'` in production; static assets referenced outside
`next/link` go through `asset()` in `lib/base-path.ts`.
