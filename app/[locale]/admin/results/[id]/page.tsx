import AdminResultIdBody from "./admin-result-id-body"

/** Static export requires ≥1 path; client still reads the real `id` from the URL after in-app navigation. */
export async function generateStaticParams() {
  return [{ id: "export-placeholder" }]
}

export default function AdminSubmissionDetailPage() {
  return <AdminResultIdBody />
}
