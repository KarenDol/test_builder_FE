import { routing } from "@/i18n/routing"
import EditQuestionBody from "./edit-question-client"

/** Static export: placeholder id; real UUIDs work via client navigation in dev. */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, id: "export-placeholder" }))
}

export default function EditQuestionPage() {
  return <EditQuestionBody />
}
