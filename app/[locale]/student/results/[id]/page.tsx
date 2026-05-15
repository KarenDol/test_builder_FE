import StudentResultIdBody from "./student-result-id-body"

export async function generateStaticParams() {
  return [{ id: "export-placeholder" }]
}

export default function StudentResultDetailPage() {
  return <StudentResultIdBody />
}
