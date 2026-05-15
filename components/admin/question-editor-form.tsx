"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClientJson, ApiError } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, X } from "lucide-react"
import type { Question, Subject } from "@/lib/types"

function emptyDefaults() {
  return {
    questionText: "",
    questionType: "single_choice" as const,
    subjectId: "",
    options: ["", "", "", ""] as string[],
    correctAnswers: [] as number[],
    points: 1,
  }
}

function stateFromQuestion(q: Question & { subjects: Subject | null }) {
  const opts = [...q.options, ...Array(4 - q.options.length).fill("")]
  const sliced = opts.slice(0, Math.max(4, q.options.length)) as string[]
  const ca = q.correct_answers as unknown[]
  return {
    questionText: q.question_text,
    questionType: q.question_type,
    subjectId: q.subject_id || "",
    options: sliced,
    correctAnswers: ca.map((x) => (typeof x === "number" ? x : parseInt(String(x), 10))),
    points: q.points,
  }
}

export type QuestionEditorFormProps = {
  subjects: Subject[]
  /** When set, PATCH existing question; otherwise POST create */
  initialQuestion?: (Question & { subjects: Subject | null }) | null
  onCancel: () => void
  onSuccess: () => void
  /** `split`: main column + right sidebar for type/subject/points (e.g. full new-question page) */
  layout?: "stacked" | "split"
}

export function QuestionEditorForm({
  subjects,
  initialQuestion,
  onCancel,
  onSuccess,
  layout = "stacked",
}: QuestionEditorFormProps) {
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"single_choice" | "multiple_choice">("single_choice")
  const [subjectId, setSubjectId] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([])
  const [points, setPoints] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    if (initialQuestion) {
      const s = stateFromQuestion(initialQuestion)
      setQuestionText(s.questionText)
      setQuestionType(s.questionType)
      setSubjectId(s.subjectId)
      setOptions(s.options)
      setCorrectAnswers(s.correctAnswers)
      setPoints(s.points)
    } else {
      const d = emptyDefaults()
      setQuestionText(d.questionText)
      setQuestionType(d.questionType)
      setSubjectId(d.subjectId)
      setOptions(d.options)
      setCorrectAnswers(d.correctAnswers)
      setPoints(d.points)
    }
    setFormError("")
  }, [initialQuestion?.id])

  const formValid = useMemo(() => {
    if (!questionText.trim() || !subjectId.trim()) return false
    if (!Number.isFinite(points) || points < 1) return false
    if (options.length < 2 || !options.every((o) => o.trim())) return false
    if (correctAnswers.length === 0) return false
    if (!correctAnswers.every((i) => Number.isInteger(i) && i >= 0 && i < options.length)) return false
    if (questionType === "single_choice" && correctAnswers.length !== 1) return false
    if (questionType === "multiple_choice" && new Set(correctAnswers).size !== correctAnswers.length)
      return false
    return true
  }, [questionText, subjectId, points, options, correctAnswers, questionType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValid) return

    setIsLoading(true)
    setFormError("")
    const optsNormalized = options.map((o) => o.trim())

    try {
      const payload = {
        question_text: questionText.trim(),
        question_type: questionType,
        subject_id: subjectId.trim(),
        options: optsNormalized,
        correct_answers: correctAnswers,
        points,
      }
      if (initialQuestion) {
        await apiClientJson(`/questions/${initialQuestion.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      } else {
        await apiClientJson("/questions", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      }
      onSuccess()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save question")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCorrectAnswer = (index: number) => {
    if (questionType === "single_choice") {
      setCorrectAnswers([index])
    } else {
      setCorrectAnswers((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      )
    }
  }

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
    setCorrectAnswers(
      correctAnswers
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i)),
    )
  }

  const typeField = (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Question type <span className="text-destructive">*</span>
      </label>
      <Select
        value={questionType}
        onValueChange={(v: "single_choice" | "multiple_choice") => {
          setQuestionType(v)
          if (v === "single_choice" && correctAnswers.length > 1) {
            setCorrectAnswers([correctAnswers[0]])
          }
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="single_choice">Single Choice</SelectItem>
          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  const subjectField = (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Subject <span className="text-destructive">*</span>
      </label>
      <Select value={subjectId} onValueChange={setSubjectId}>
        <SelectTrigger>
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const pointsField = (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Points <span className="text-destructive">*</span>
      </label>
      <Input
        type="number"
        min={1}
        value={points}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          setPoints(Number.isFinite(n) && n >= 1 ? n : 1)
        }}
        className={layout === "split" ? "w-full" : "w-24"}
        required
      />
    </div>
  )

  const attributesSidebar = (
    <div className="space-y-4">
      {typeField}
      {subjectField}
      {pointsField}
    </div>
  )

  const optionsBlock = (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {questionType === "single_choice"
          ? "Options (select the correct answer)"
          : "Options (check all correct answers)"}{" "}
        <span className="text-destructive">*</span>
      </label>
      <div className="space-y-2">
        {questionType === "single_choice" ? (
          <RadioGroup
            className="space-y-2"
            value={correctAnswers.length === 1 ? String(correctAnswers[0]) : undefined}
            onValueChange={(v) => setCorrectAnswers([parseInt(v, 10)])}
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <RadioGroupItem value={String(index)} id={`correct-opt-${index}`} />
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options]
                    newOptions[index] = e.target.value
                    setOptions(newOptions)
                  }}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
        ) : (
          options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={correctAnswers.includes(index)}
                onCheckedChange={() => toggleCorrectAnswer(index)}
              />
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...options]
                  newOptions[index] = e.target.value
                  setOptions(newOptions)
                }}
                className="flex-1"
              />
              {options.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addOption}>
        <Plus className="mr-2 h-4 w-4" />
        Add Option
      </Button>
    </div>
  )

  const footerBlock = (
    <>
      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formValid}>
          {isLoading ? "Saving..." : initialQuestion ? "Update" : "Create"}
        </Button>
      </div>
    </>
  )

  if (layout === "split") {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(15rem,18rem)] lg:items-start">
          <div className="min-w-0 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Question text <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Enter your question..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={5}
                required
              />
            </div>
            {optionsBlock}
          </div>

          <aside className="rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm lg:sticky lg:top-6">
            {attributesSidebar}
          </aside>
        </div>
        {footerBlock}
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Question text <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Enter your question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {typeField}
        {subjectField}
      </div>

      {pointsField}

      {optionsBlock}

      {footerBlock}
    </form>
  )
}
