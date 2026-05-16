"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react"
import type { Question, Test, Submission } from "@/lib/types"
import { MathOptionReadonly, MathQuestionStemView } from "@/components/math-question-view"
import { QuestionReferenceTools } from "@/components/student/question-reference-tools"
import { seededOptionIndices } from "@/lib/seeded-shuffle"

interface TestTakingInterfaceProps {
  test: Test & {
    questions: Question[]
    subjects: { name: string } | null
  }
  existingSubmission: Submission | null
}

function normalizeAnswers(raw: Record<string, unknown> | undefined): Record<string, number[]> {
  if (!raw) return {}
  const out: Record<string, number[]> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) {
      out[k] = v.map((x) => (typeof x === "number" ? x : parseInt(String(x), 10))).filter((n) => !Number.isNaN(n))
    }
  }
  return out
}

export function TestTakingInterface({
  test,
  existingSubmission,
}: TestTakingInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>(
    normalizeAnswers(existingSubmission?.answers as Record<string, unknown> | undefined),
  )
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState((test.duration_minutes || 60) * 60)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(existingSubmission?.id || null)
  const router = useRouter()
  const submittedRef = useRef(false)

  const questions = test.questions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const optionOrder = useMemo(() => {
    const q = currentQuestion
    const n = q.options.length
    if (!(q.shuffle_answer_options ?? false)) {
      return Array.from({ length: n }, (_, i) => i)
    }
    return seededOptionIndices(`${test.id}:${q.id}`, n)
  }, [test.id, currentQuestion.id, currentQuestion.shuffle_answer_options, currentQuestion.options.length])

  useEffect(() => {
    const initSubmission = async () => {
      if (!submissionId) {
        try {
          const data = await apiClientJson<Submission>("/submissions", {
            method: "POST",
            body: JSON.stringify({ test_id: test.id }),
          })
          if (data?.id) setSubmissionId(data.id)
        } catch (e) {
          console.error(e)
        }
      }
    }
    initSubmission()
  }, [submissionId, test.id])

  const saveAnswers = useCallback(async () => {
    if (!submissionId) return
    try {
      await apiClientJson(`/submissions/${submissionId}`, {
        method: "PATCH",
        body: JSON.stringify({ answers }),
      })
    } catch (e) {
      console.error(e)
    }
  }, [submissionId, answers])

  useEffect(() => {
    const interval = setInterval(saveAnswers, 30000)
    return () => clearInterval(interval)
  }, [saveAnswers])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (optionIndex: number) => {
    const questionId = currentQuestion.id
    const currentAnswers = answers[questionId] || []

    if (currentQuestion.question_type === "single_choice") {
      setAnswers({ ...answers, [questionId]: [optionIndex] })
    } else {
      if (currentAnswers.includes(optionIndex)) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter((i) => i !== optionIndex),
        })
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, optionIndex],
        })
      }
    }
  }

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id)
    } else {
      newFlagged.add(currentQuestion.id)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleSubmit = async () => {
    if (submittedRef.current || isSubmitting || !submissionId) return
    submittedRef.current = true
    setIsSubmitting(true)

    let totalScore = 0
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

    questions.forEach((question) => {
      const userAnswers = answers[question.id] || []
      const correctRaw = question.correct_answers as unknown[]
      const correctAnswers = correctRaw.map((a) =>
        typeof a === "number" ? a : parseInt(String(a), 10),
      )

      const isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((a) => correctAnswers.includes(a))

      if (isCorrect) {
        totalScore += question.points
      }
    })

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    await apiClientJson(`/submissions/${submissionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        answers,
        total_score: totalScore,
        max_score: maxScore,
        percentage,
        submitted_at: new Date().toISOString(),
      }),
    })

    router.push(`/student/results/${submissionId}`)
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].length > 0).length

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">{test.title}</h1>
            {test.subjects?.name && (
              <Badge variant="secondary" className="mt-1">
                {test.subjects.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span
                className={`font-mono text-lg ${timeRemaining < 300 ? "text-destructive" : ""}`}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button onClick={() => setShowSubmitDialog(true)}>Submit Test</Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFlag}
                  className={flaggedQuestions.has(currentQuestion.id) ? "text-warning" : ""}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag for Review"}
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="min-w-0 text-lg font-medium leading-relaxed">
                  <MathQuestionStemView
                    math={currentQuestion.math}
                    fallbackText={currentQuestion.question_text}
                    className="w-full"
                  />
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">{currentQuestion.points} pts</Badge>
                </CardAction>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.question_type === "single_choice"
                    ? "Select one answer"
                    : "Select all that apply"}
                </p>
                <QuestionReferenceTools
                  showCalculator={Boolean(currentQuestion.show_calculator)}
                  showPeriodicTable={Boolean(currentQuestion.show_periodic_table)}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.question_type === "single_choice" ? (
                  <RadioGroup
                    className="space-y-3"
                    value={
                      (answers[currentQuestion.id] || []).length > 0
                        ? String((answers[currentQuestion.id] || [])[0])
                        : ""
                    }
                    onValueChange={(v) =>
                      setAnswers({
                        ...answers,
                        [currentQuestion.id]: [parseInt(v, 10)],
                      })
                    }
                  >
                    {optionOrder.map((index) => {
                      const option = currentQuestion.options[index] ?? ""
                      const selected = (answers[currentQuestion.id] || [])[0] === index
                      const optionId = `answer-${currentQuestion.id}-${index}`
                      return (
                        <div
                          key={index}
                          className={`flex w-full items-center gap-3 rounded-lg border p-4 transition-colors ${
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <RadioGroupItem value={String(index)} id={optionId} />
                          <Label
                            htmlFor={optionId}
                            className="min-w-0 flex-1 cursor-pointer text-base font-medium leading-relaxed"
                          >
                            {currentQuestion.math ? (
                              <MathOptionReadonly
                                latex={currentQuestion.math.options_latex[index] ?? option}
                              />
                            ) : (
                              option
                            )}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                ) : (
                  optionOrder.map((index) => {
                    const option = currentQuestion.options[index] ?? ""
                    const isSelected = (answers[currentQuestion.id] || []).includes(index)
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAnswerSelect(index)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox checked={isSelected} />
                        <span className="min-w-0 flex-1 text-base font-medium leading-relaxed">
                          {currentQuestion.math ? (
                            <MathOptionReadonly
                              latex={currentQuestion.math.options_latex[index] ?? option}
                            />
                          ) : (
                            option
                          )}
                        </span>
                      </button>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="w-64 border-l bg-card p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Questions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {answeredCount} of {questions.length} answered
          </p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers[q.id] && answers[q.id].length > 0
              const isFlagged = flaggedQuestions.has(q.id)
              const isCurrent = index === currentQuestionIndex

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isAnswered
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                  {isFlagged && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-warning">
                  Warning: You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
              {flaggedQuestions.size > 0 && (
                <span className="block mt-2 text-warning">
                  You have {flaggedQuestions.size} flagged questions for review.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
