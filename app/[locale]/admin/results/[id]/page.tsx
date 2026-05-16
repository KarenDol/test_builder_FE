import { routing } from "@/i18n/routing"
import AdminResultIdBody from "./admin-result-id-body"

/** Static export: supply `locale` + `id`; real submission IDs work via client navigation / dev. */
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, id: "export-placeholder" }))
}

export default function AdminSubmissionDetailPage() {
  return <AdminResultIdBody />
}
