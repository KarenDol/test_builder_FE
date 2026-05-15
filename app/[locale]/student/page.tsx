"use client"

import { useEffect, useState } from "react"
import { apiClientJson } from "@/lib/client-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { ClipboardList, BarChart3, Clock, ArrowRight } from "lucide-react"
import type { Test, Submission } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"

type StudentDashboard = {
  total_tests: number
  completed_tests: number
  average_percentage: number
  tests_preview: (Test & {
    subjects?: { id: string; name: string } | null
    test_questions: { id: string }[]
  })[]
  recent_submissions: (Submission & {
    tests?: {
      id: string
      title: string
      subjects?: { name: string } | null
    } | null
  })[]
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboard | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await apiClientJson<StudentDashboard>("/stats/student-dashboard")
        if (!cancelled) setData(d)
      } catch {
        if (!cancelled) setData(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const tests = data.tests_preview
  const submissions = data.recent_submissions

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Track your progress and take practice tests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Tests</CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.total_tests}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tests Completed</CardTitle>
            <BarChart3 className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.completed_tests}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <BarChart3 className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.average_percentage.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Available Tests</CardTitle>
            <Link href="/student/tests">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tests && tests.length > 0 ? (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{test.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {test.subjects?.name && (
                          <Badge variant="secondary">{test.subjects.name}</Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.duration_minutes} min
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {test.test_questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                    <Link href={`/student/tests/${test.id}`}>
                      <Button size="sm">Start Test</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No tests available yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Results</CardTitle>
            <Link href="/student/results">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {submissions && submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/student/results/${submission.id}`}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{submission.tests?.title || "Unknown Test"}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.submitted_at
                          ? new Date(submission.submitted_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div className="shrink-0 pl-4 text-right">
                      <Badge
                        variant={
                          (submission.percentage || 0) >= 80
                            ? "default"
                            : (submission.percentage || 0) >= 60
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {submission.percentage?.toFixed(1)}%
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {submission.total_score}/{submission.max_score} pts
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No results yet. Take a test to see your scores!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
