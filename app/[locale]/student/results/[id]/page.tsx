import { routing } from "@/i18n/routing"
import StudentResultIdBody from "./student-result-id-body"

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, id: "export-placeholder" }))
}

export default function StudentResultDetailPage() {
  return <StudentResultIdBody />
}
