"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { FileText, Trophy, Target, Calendar } from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { Submission, Test } from "@/lib/types"

interface SubmissionWithTest extends Submission {
  tests: Test | null
}

export default function StudentResultsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithTest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      const data = await apiClientJson<SubmissionWithTest[]>("/submissions?completed_only=true")
      setSubmissions(data)
    } catch {
      setSubmissions([])
    }
    setLoading(false)
  }

  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc, s) => acc + Number(s.percentage), 0) / submissions.length
      : 0

  const bestScore =
    submissions.length > 0 ? Math.max(...submissions.map((s) => Number(s.percentage))) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Results</h1>
        <p className="text-muted-foreground mt-1">View your test history and performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
          <CardDescription>All your completed tests</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No results yet</h3>
              <p className="text-muted-foreground mt-1">Complete a test to see your results here</p>
              <Button asChild className="mt-4">
                <Link href="/student/tests">Browse Tests</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Link
                  key={submission.id}
                  href={`/student/results/${submission.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-card px-6 py-5 md:px-7 md:py-6 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground">
                        {submission.tests?.title || "Unknown Test"}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Not submitted"}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pl-4 text-right md:pl-6">
                    <div className="text-lg font-bold text-foreground">
                      {submission.total_score}/{submission.max_score}
                    </div>
                    <Badge
                      variant={
                        Number(submission.percentage) >= 70
                          ? "default"
                          : Number(submission.percentage) >= 50
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {Number(submission.percentage).toFixed(1)}%
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
