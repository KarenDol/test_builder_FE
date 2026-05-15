/** Read `role` from JWT payload without verification (routing/UI only). */
export function roleFromAccessToken(token: string): string {
  try {
    const part = token.split(".")[1]
    if (!part) return "student"
    const json = JSON.parse(
      atob(part.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { role?: string }
    return String(json.role ?? "student")
  } catch {
    return "student"
  }
}
