import TakeTestBody from "./take-test-body"

export async function generateStaticParams() {
  return [{ id: "export-placeholder" }]
}

export default function TakeTestPage() {
  return <TakeTestBody />
}
