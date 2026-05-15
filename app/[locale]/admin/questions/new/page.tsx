"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import type { Subject } from "@/lib/types"
import { NewQuestionClient } from "./new-question-client"
import { Spinner } from "@/components/ui/spinner"

export default function NewQuestionPage() {
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

  return <NewQuestionClient subjects={subjects} />
}
