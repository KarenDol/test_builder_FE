"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { Clock, FileQuestion, CheckCircle } from "lucide-react"
import type { Test, Submission } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

type TestCard = Test & {
  subjects?: { name: string } | null
  test_questions: { id: string }[]
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<TestCard[] | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [tList, sList] = await Promise.all([
          apiClientJson<TestCard[]>("/tests/active"),
          apiClientJson<Submission[]>("/submissions?completed_only=true"),
        ])
        if (!cancelled) {
          setTests(tList)
          setSubmissions(sList ?? [])
        }
      } catch {
        if (!cancelled) {
          setTests([])
          setSubmissions([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (tests === null) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const completedTestIds = new Set(submissions?.map((s) => s.test_id) || [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Available Tests</h1>
        <p className="text-muted-foreground mt-1">Choose a test to practice</p>
      </div>

      {tests && tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => {
            const isCompleted = completedTestIds.has(test.id)
            return (
              <Card key={test.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      {test.subjects?.name && (
                        <Badge variant="secondary" className="mt-2">
                          {test.subjects.name}
                        </Badge>
                      )}
                    </div>
                    {isCompleted && <CheckCircle className="h-5 w-5 text-accent" />}
                  </div>
                  {test.description && (
                    <CardDescription className="mt-2 line-clamp-2">{test.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-4 w-4" />
                      {test.test_questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.duration_minutes} min
                    </span>
                  </div>
                  <Link href={`/student/tests/${test.id}`} className="w-full">
                    <Button className="w-full">{isCompleted ? "Retake Test" : "Start Test"}</Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No tests available at the moment. Check back later!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
