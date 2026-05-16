"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Trophy } from "lucide-react"
import { MathOptionReadonly, MathQuestionStemView } from "@/components/math-question-view"
import type { Submission, Test, Question, TestQuestion } from "@/lib/types"

export interface TestWithQuestions extends Test {
  test_questions: (TestQuestion & { questions: Question })[]
}

export type SubmissionDetail = Submission & {
  profiles?: { name: string | null; email: string | null } | null
  tests: TestWithQuestions | null
}

export function toIndices(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((a) => (typeof a === "number" ? a : parseInt(String(a), 10)))
    .filter((n) => !Number.isNaN(n))
}

export function SubmissionResultReview({ submission }: { submission: SubmissionDetail }) {
  const t = useTranslations("SubmissionReview")
  if (!submission.tests) return null

  const answersRaw = submission.answers as Record<string, unknown>
  const questions = submission.tests.test_questions
    .sort((a, b) => a.question_order - b.question_order)
    .map((tq) => tq.questions)

  const percentage = Number(submission.percentage)

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{percentage.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">{t("finalScore")}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {submission.total_score}/{submission.max_score}
              </div>
              <p className="text-sm text-muted-foreground">{t("pointsEarned")}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{questions.length}</div>
              <p className="text-sm text-muted-foreground">{t("totalQuestions")}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {submission.submitted_at && submission.started_at
                  ? Math.round(
                      (new Date(submission.submitted_at).getTime() -
                        new Date(submission.started_at).getTime()) /
                        60000,
                    )
                  : 0}{" "}
                {t("timeUnitMin")}
              </div>
              <p className="text-sm text-muted-foreground">{t("timeTaken")}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("performance")}</span>
              <Badge
                variant={
                  percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"
                }
              >
                {percentage >= 70 ? t("bandPassed") : percentage >= 50 ? t("bandAverage") : t("bandNeedsWork")}
              </Badge>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("questionReview")}</CardTitle>
          <CardDescription>{t("questionReviewDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userIndices = toIndices(answersRaw[question.id])
            const correctIndices = toIndices(question.correct_answers)
            const isCorrect =
              userIndices.length === correctIndices.length &&
              userIndices.every((a) => correctIndices.includes(a))
            const maxPts = Number(question.points) || 0
            const earnedPts = isCorrect ? maxPts : 0

            return (
              <div
                key={question.id}
                className={`rounded-lg border p-4 ${
                  isCorrect
                    ? "border-emerald-500/35 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-950/25"
                    : "border-destructive/50 bg-destructive/5 dark:bg-destructive/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isCorrect
                        ? "bg-emerald-600 text-white dark:bg-emerald-500"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t("questionN", { n: index + 1 })}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold tabular-nums ${
                          isCorrect
                            ? "border-emerald-600/50 bg-emerald-100/80 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-100"
                            : "border-destructive/40 bg-destructive/10 text-destructive dark:text-destructive"
                        }`}
                      >
                        {t("questionPoints", { earned: earnedPts, max: maxPts })}
                      </Badge>
                    </div>
                    <div className="mb-3 font-medium text-foreground">
                      <MathQuestionStemView math={question.math} fallbackText={question.question_text} />
                    </div>

                    <div className="space-y-2">
                      {(question.options as string[]).map((option, optIndex) => {
                        const isSelected = userIndices.includes(optIndex)
                        const isCorrectOption = correctIndices.includes(optIndex)
                        const optLatex = question.math?.options_latex?.[optIndex]

                        return (
                          <div
                            key={optIndex}
                            className={`rounded-md p-3 text-sm ${
                              isCorrectOption
                                ? "border border-emerald-500 bg-emerald-100/90 text-foreground dark:border-emerald-600 dark:bg-emerald-950/50"
                                : isSelected
                                  ? "border border-destructive bg-destructive/20 text-foreground dark:bg-destructive/25"
                                  : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectOption && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                              )}
                              {isSelected && !isCorrectOption && (
                                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                              )}
                              {question.math ? (
                                <MathOptionReadonly latex={optLatex ?? option} />
                              ) : (
                                <span>{option}</span>
                              )}
                              {isSelected && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {t("yourAnswer")}
                                </Badge>
                              )}
                              {isCorrectOption && !isSelected && (
                                <Badge
                                  variant="outline"
                                  className="ml-auto border-emerald-600/50 bg-emerald-50 text-xs text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100"
                                >
                                  {t("correctAnswer")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
