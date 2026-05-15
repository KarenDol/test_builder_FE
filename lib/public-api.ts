/** Base URL for the FastAPI backend (no trailing slash). Inlined at build time on the client. */
export function getPublicApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }
  return base
}
