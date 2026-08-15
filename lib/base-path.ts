// GitHub Pages serves this site from /Nikhil_Obuleni, so every static asset
// referenced outside of next/link needs the prefix in production builds.
export const basePath = process.env.NODE_ENV === "production" ? "/Nikhil_Obuleni" : ""

export const asset = (path: string) => `${basePath}${path}`
