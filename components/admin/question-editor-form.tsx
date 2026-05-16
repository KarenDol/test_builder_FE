"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { apiClientJson, apiClientUpload, ApiError } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImagePlus, Plus, X } from "lucide-react"
import { apiAssetUrl } from "@/lib/public-api"
import type { Question, Subject } from "@/lib/types"
import { FormulaScratchpad } from "@/components/formula-scratchpad"

function FormSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5">
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function emptyDefaults() {
  return {
    useMathMode: false,
    questionText: "",
    questionType: "single_choice" as const,
    subjectId: "",
    options: ["", "", "", ""] as string[],
    correctAnswers: [] as number[],
    points: 1,
    imageUrls: [] as string[],
    shuffleAnswerOptions: false,
    showCalculator: false,
    showPeriodicTable: false,
  }
}

function stateFromQuestion(q: Question & { subjects: Subject | null }) {
  const opts = [...q.options, ...Array(4 - q.options.length).fill("")]
  const sliced = opts.slice(0, Math.max(4, q.options.length)) as string[]
  const ca = q.correct_answers as unknown[]
  return {
    useMathMode: Boolean(q.math),
    questionText: q.question_text,
    questionType: q.question_type,
    subjectId: q.subject_id || "",
    options: sliced,
    correctAnswers: ca.map((x) => (typeof x === "number" ? x : parseInt(String(x), 10))),
    points: q.points,
    imageUrls: q.math?.image_urls ? [...q.math.image_urls] : [],
    shuffleAnswerOptions: Boolean(q.shuffle_answer_options),
    showCalculator: Boolean(q.show_calculator),
    showPeriodicTable: Boolean(q.show_periodic_table),
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
  const [useMathMode, setUseMathMode] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [shuffleAnswerOptions, setShuffleAnswerOptions] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showPeriodicTable, setShowPeriodicTable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialQuestion) {
      const s = stateFromQuestion(initialQuestion)
      setUseMathMode(s.useMathMode)
      setQuestionText(s.questionText)
      setQuestionType(s.questionType)
      setSubjectId(s.subjectId)
      setOptions(s.options)
      setCorrectAnswers(s.correctAnswers)
      setPoints(s.points)
      setImageUrls(s.imageUrls)
      setShuffleAnswerOptions(s.shuffleAnswerOptions)
      setShowCalculator(s.showCalculator)
      setShowPeriodicTable(s.showPeriodicTable)
    } else {
      const d = emptyDefaults()
      setUseMathMode(d.useMathMode)
      setQuestionText(d.questionText)
      setQuestionType(d.questionType)
      setSubjectId(d.subjectId)
      setOptions(d.options)
      setCorrectAnswers(d.correctAnswers)
      setPoints(d.points)
      setImageUrls(d.imageUrls)
      setShuffleAnswerOptions(d.shuffleAnswerOptions)
      setShowCalculator(d.showCalculator)
      setShowPeriodicTable(d.showPeriodicTable)
    }
    setFormError("")
  }, [initialQuestion?.id])

  const formValid = useMemo(() => {
    const hasStem = questionText.trim().length > 0
    if (!hasStem || !subjectId.trim()) return false
    if (!Number.isFinite(points) || points < 1) return false
    if (options.length < 2 || !options.every((o) => o.trim())) return false
    if (correctAnswers.length === 0) return false
    if (!correctAnswers.every((i) => Number.isInteger(i) && i >= 0 && i < options.length)) return false
    if (questionType === "single_choice" && correctAnswers.length !== 1) return false
    if (questionType === "multiple_choice" && new Set(correctAnswers).size !== correctAnswers.length)
      return false
    return true
  }, [questionText, useMathMode, subjectId, points, options, correctAnswers, questionType])

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
        math: useMathMode
          ? {
              stem_latex: "",
              options_latex: optsNormalized,
              image_urls: imageUrls,
            }
          : null,
        shuffle_answer_options: shuffleAnswerOptions,
        show_calculator: showCalculator,
        show_periodic_table: showPeriodicTable,
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

  const setOptionAt = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const onMathModeChecked = (checked: boolean) => {
    setUseMathMode(checked)
    if (!checked) {
      setImageUrls([])
    }
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setFormError("")
    try {
      const data = await apiClientUpload<{ url: string }>("/questions/upload-image", file)
      if (data?.url) setImageUrls((p) => [...p, data.url])
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not upload image")
    }
  }

  const mathModeToggle = (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5">
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium">Math (LaTeX)</p>
        <p className="text-xs text-muted-foreground">
          Use the shared formula scratchpad below the stem, then paste into the wording or into each option (plain
          text fields).
        </p>
      </div>
      <Switch checked={useMathMode} onCheckedChange={onMathModeChecked} />
    </div>
  )

  const figuresBlock =
    useMathMode ? (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium">Figures</label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImagePick}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Add image
          </Button>
        </div>
        {imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {imageUrls.map((url, i) => (
              <div key={`${url}-${i}`} className="relative">
                <img
                  src={apiAssetUrl(url)}
                  alt=""
                  className="h-28 max-w-full rounded-md border border-border object-contain"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute -right-2 -top-2 h-7 w-7 shadow-sm"
                  onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    ) : null

  const stemBlock = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {useMathMode ? "Question wording" : "Question text"} <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder={
            useMathMode
              ? "Plain text with optional inline math, e.g. Solve $\\frac{1}{2}+x$ …"
              : "Enter your question…"
          }
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={useMathMode ? (layout === "split" ? 4 : 3) : layout === "split" ? 5 : 4}
          required
        />
      </div>
      {useMathMode ? <FormulaScratchpad /> : null}
      {figuresBlock}
    </div>
  )

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

  const questionToolSettings = (
    <div className="space-y-3">
      <FormSwitchRow
        title="Shuffle answer options"
        description="Randomize answer order for students (same order if they leave and return)."
        checked={shuffleAnswerOptions}
        onCheckedChange={setShuffleAnswerOptions}
      />
      <FormSwitchRow
        title="Add calculator"
        description="Show an in-app engineering calculator while taking a test."
        checked={showCalculator}
        onCheckedChange={setShowCalculator}
      />
      <FormSwitchRow
        title="Add Periodic table"
        description="Show a periodic table reference on the question while taking a test."
        checked={showPeriodicTable}
        onCheckedChange={setShowPeriodicTable}
      />
    </div>
  )

  const attributesSidebar = (
    <div className="space-y-4">
      {mathModeToggle}
      {typeField}
      {subjectField}
      {pointsField}
      {questionToolSettings}
    </div>
  )

  const optionsBlock = (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {useMathMode
          ? "Options (paste from scratchpad — same as wording)"
          : questionType === "single_choice"
            ? "Options (select the correct answer)"
            : "Options (check all correct answers)"}{" "}
        <span className="text-destructive">*</span>
      </label>
      <div className="space-y-2">
        {questionType === "single_choice" ? (
          <RadioGroup
            className="space-y-2"
            value={correctAnswers.length === 1 ? String(correctAnswers[0]) : ""}
            onValueChange={(v) => setCorrectAnswers([parseInt(v, 10)])}
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-start gap-2">
                <RadioGroupItem value={String(index)} id={`correct-opt-${index}`} className="mt-2.5" />
                {useMathMode ? (
                  <Textarea
                    placeholder={"Option " + (index + 1) + " — e.g. $\\frac{1}{2}$ or plain text"}
                    value={option}
                    onChange={(e) => setOptionAt(index, e.target.value)}
                    rows={2}
                    className="min-h-0 min-w-0 flex-1 resize-y font-mono text-sm"
                  />
                ) : (
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
                )}
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
            <div key={index} className="flex items-start gap-2">
              <Checkbox
                checked={correctAnswers.includes(index)}
                onCheckedChange={() => toggleCorrectAnswer(index)}
                className="mt-2.5"
              />
              {useMathMode ? (
                <Textarea
                  placeholder={"Option " + (index + 1) + " — e.g. $\\frac{1}{2}$ or plain text"}
                  value={option}
                  onChange={(e) => setOptionAt(index, e.target.value)}
                  rows={2}
                  className="min-h-0 min-w-0 flex-1 resize-y font-mono text-sm"
                />
              ) : (
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
              )}
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
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(18rem,22rem)] lg:items-start">
          <div className="min-w-0 space-y-6">
            {stemBlock}
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
      {mathModeToggle}

      {stemBlock}

      <div className="grid gap-4 sm:grid-cols-2">
        {typeField}
        {subjectField}
      </div>

      {pointsField}

      {questionToolSettings}

      {optionsBlock}

      {footerBlock}
    </form>
  )
}
