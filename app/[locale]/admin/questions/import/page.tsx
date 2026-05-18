"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { PdfImportManager } from "@/components/admin/pdf-import-manager"
import type { Subject } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

export default function ImportQuestionsPage() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await apiClientJson<Subject[]>("/subjects")
        if (!cancelled) setSubjects(s)
      } catch {
        if (!cancelled) setSubjects([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!subjects) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">Import from PDF</h1>
        <p className="mt-4 text-muted-foreground">
          Create at least one subject before importing questions.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Import from PDF</h1>
        <p className="mt-1 text-muted-foreground">
          Extract multiple-choice questions from a PDF or Excel file using AI. PDF pages are sent
          one-by-one as images so math is converted to LaTeX ($...$). Review, then save to your
          question bank.
        </p>
      </div>
      <PdfImportManager subjects={subjects} />
    </div>
  )
}
