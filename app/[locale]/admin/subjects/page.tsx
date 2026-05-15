"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { SubjectsManager } from "@/components/admin/subjects-manager"
import type { Subject } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

export default function SubjectsPage() {
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-1">Organize your question bank by subject area</p>
      </div>

      <SubjectsManager initialSubjects={subjects} />
    </div>
  )
}
