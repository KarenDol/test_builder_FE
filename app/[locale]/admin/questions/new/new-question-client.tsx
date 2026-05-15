"use client"

import { ArrowLeft } from "lucide-react"
import { Link, useRouter } from "@/i18n/navigation"
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
import type { Subject } from "@/lib/types"

export function NewQuestionClient({ subjects }: { subjects: Subject[] }) {
  const router = useRouter()
  const back = () => router.push("/admin/questions")

  if (subjects.length === 0) {
    return (
      <XPatternBackdrop>
        <div className="p-8 md:px-10 md:py-10">
          <Button variant="ghost" asChild className="mb-6 -ml-2">
            <Link href="/admin/questions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to questions
            </Link>
          </Button>
          <Card className="max-w-lg border-border/80 bg-card/95 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle>No subjects yet</CardTitle>
              <CardDescription>Create at least one subject before adding questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/subjects">Go to subjects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </XPatternBackdrop>
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
            <CardTitle>New question</CardTitle>
            <CardDescription>
              Add a question to the bank. Every field is required before you can save.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-2 sm:px-8">
            <QuestionEditorForm
              subjects={subjects}
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
