"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { QuestionsManager } from "@/components/admin/questions-manager"
import type { Question, Subject } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<(Question & { subjects: Subject | null })[] | null>(null)
  const [subjects, setSubjects] = useState<Subject[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [q, s] = await Promise.all([
          apiClientJson<(Question & { subjects: Subject | null })[]>("/questions"),
          apiClientJson<Subject[]>("/subjects"),
        ])
        if (!cancelled) {
          setQuestions(q)
          setSubjects(s)
        }
      } catch {
        if (!cancelled) {
          setQuestions([])
          setSubjects([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!questions || !subjects) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Questions</h1>
        <p className="text-muted-foreground mt-1">Build and manage your question bank</p>
      </div>

      <QuestionsManager initialQuestions={questions} subjects={subjects} />
    </div>
  )
}
