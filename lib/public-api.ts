/** Base URL for the FastAPI backend (no trailing slash). Inlined at build time on the client. */
export function getPublicApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }
  return base
}

/** Resolve an API-relative upload path (e.g. `/uploads/...`) to an absolute URL for `<img src>`. */
export function apiAssetUrl(relativePath: string): string {
  if (!relativePath) return ""
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) return relativePath
  const base = getPublicApiBase()
  const p = relativePath.startsWith("/") ? relativePath : `/${relativePath}`
  return `${base}${p}`
}
