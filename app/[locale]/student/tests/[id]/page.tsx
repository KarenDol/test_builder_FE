import { routing } from "@/i18n/routing"
import TakeTestBody from "./take-test-body"

/** `output: export` — Next needs every dynamic segment (`locale` + `id`). Real test IDs still work via client navigation / dev. */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, id: "export-placeholder" }))
}

export default function TakeTestPage() {
  return <TakeTestBody />
}
