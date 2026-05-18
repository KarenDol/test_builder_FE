"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Link, useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QuestionEditorForm } from "@/components/admin/question-editor-form"
import { XPatternBackdrop } from "@/components/x-pattern-backdrop"
import { Spinner } from "@/components/ui/spinner"
import type { Question, Subject } from "@/lib/types"

export default function EditQuestionBody() {
  const params = useParams()
  const router = useRouter()
  const questionId = String(params.id ?? "")

  const [subjects, setSubjects] = useState<Subject[] | null>(null)
  const [question, setQuestion] = useState<(Question & { subjects: Subject | null }) | null>(null)

  useEffect(() => {
    if (!questionId) return
    let cancelled = false
    ;(async () => {
      try {
        const [questions, subjectList] = await Promise.all([
          apiClientJson<(Question & { subjects: Subject | null })[]>("/questions"),
          apiClientJson<Subject[]>("/subjects"),
        ])
        if (cancelled) return
        const found = questions.find((q) => q.id === questionId) ?? null
        if (!found) {
          router.push("/admin/questions")
          return
        }
        setQuestion(found)
        setSubjects(subjectList)
      } catch {
        if (!cancelled) router.push("/admin/questions")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [questionId, router])

  const back = () => router.push("/admin/questions")

  if (!subjects || !question) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <XPatternBackdrop>
      <div className="p-8 md:px-10 md:py-10">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link href="/admin/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to questions
          </Link>
        </Button>
        <Card className="max-w-5xl border-border/80 bg-card/95 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Edit question</CardTitle>
            <CardDescription>Update this question in the bank.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-2 sm:px-8">
            <QuestionEditorForm
              key={question.id}
              subjects={subjects}
              initialQuestion={question}
              onCancel={back}
              onSuccess={back}
              layout="split"
            />
          </CardContent>
        </Card>
      </div>
    </XPatternBackdrop>
  )
}
