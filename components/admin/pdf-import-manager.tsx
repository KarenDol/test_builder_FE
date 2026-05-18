"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import {
  clearDraftQuestions,
  draftValidationMessage,
  isDraftValid,
  loadDraftQuestions,
  normalizeParsedQuestion,
  sanitizeDraftOptions,
  saveDraftQuestions,
  uploadPdfForImport,
  type DraftImportQuestion,
  type ImportErrorEvent,
  type ImportProgressEvent,
  type ParsedPdfQuestion,
} from "@/lib/pdf-import"
import type { Subject } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MixedMathText } from "@/components/mixed-math-text"
import { ArrowLeft, FileUp, Loader2, Save, Trash2 } from "lucide-react"

interface PdfImportManagerProps {
  subjects: Subject[]
}

export function PdfImportManager({ subjects }: PdfImportManagerProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "")
  const [file, setFile] = useState<File | null>(null)
  const [drafts, setDrafts] = useState<DraftImportQuestion[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isFetching, setIsFetching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)

  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setDrafts(loadDraftQuestions())
  }, [])

  useEffect(() => {
    saveDraftQuestions(drafts)
  }, [drafts])

  const updateDraft = useCallback((id: string, patch: Partial<DraftImportQuestion>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])

  const pickFile = (f?: File | null) => {
    if (!f) {
      setFile(null)
      return
    }
    const ok =
      f.type === "application/pdf" ||
      f.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      f.name.toLowerCase().endsWith(".pdf") ||
      f.name.toLowerCase().endsWith(".xlsx")
    if (!ok) {
      setError("Please upload a PDF or .xlsx file.")
      setFile(null)
      return
    }
    setError(null)
    setFile(f)
  }

  const startExtraction = async () => {
    if (!file) {
      setError("Select a PDF or Excel file first.")
      return
    }
    if (!subjectId) {
      setError("Select a subject for imported questions.")
      return
    }

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setIsFetching(true)
    setProgress(0)
    setProgressText("Starting…")
    setError(null)
    setImportResult(null)

    try {
      await uploadPdfForImport(file, controller.signal, (obj) => {
        const row = obj as ImportProgressEvent | ImportErrorEvent | ParsedPdfQuestion
        if ("type" in row && row.type === "progress") {
          setProgress(row.percent ?? 0)
          setProgressText(`${row.current}/${row.total} pages`)
          return
        }
        if ("type" in row && row.type === "error") {
          throw new Error(row.message)
        }
        if ("content" in row && "answers" in row) {
          const draft = normalizeParsedQuestion(row as ParsedPdfQuestion)
          if (draft) setDrafts((prev) => [...prev, draft])
        }
      })
      setProgress(100)
      setProgressText("Done")
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return
      setError((e as Error)?.message ?? "Failed to extract problems")
    } finally {
      setIsFetching(false)
    }
  }

  const cancelExtraction = () => {
    controllerRef.current?.abort()
    setIsFetching(false)
    setProgressText("Canceled")
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === drafts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(drafts.map((d) => d.id)))
  }

  const approveSelected = () => {
    setDrafts((prev) =>
      prev.map((d) => (selectedIds.has(d.id) ? { ...d, approved: true } : d)),
    )
    setSelectedIds(new Set())
  }

  const removeSelected = () => {
    setDrafts((prev) => prev.filter((d) => !selectedIds.has(d.id)))
    setSelectedIds(new Set())
  }

  const importApproved = async () => {
    const approved = drafts.filter((d) => d.approved)
    const toSave = approved.filter(isDraftValid)
    const incomplete = approved.filter((d) => !isDraftValid(d))

    if (!approved.length) {
      setError("Approve at least one question before importing.")
      return
    }
    if (!toSave.length) {
      setError(
        incomplete.length
          ? `${incomplete.length} approved question(s) are incomplete (need question text, at least 2 options, and a correct answer). Edit or unapprove them.`
          : "No valid questions to import.",
      )
      return
    }
    if (!subjectId) {
      setError("Select a subject.")
      return
    }

    setIsImporting(true)
    setError(null)
    if (incomplete.length) {
      setImportResult(
        `Skipping ${incomplete.length} incomplete approved question(s). Importing ${toSave.length}…`,
      )
    }
    try {
      const res = await apiClientJson<{
        created_count: number
        errors: { index: number; detail: string }[]
      }>("/questions/import-batch", {
        method: "POST",
        body: JSON.stringify({
          subject_id: subjectId,
          questions: toSave.map((d) => ({
            question_text: d.question_text.trim(),
            options: sanitizeDraftOptions(d.options),
            correct_answers: d.correct_answers,
            question_type: d.question_type,
            points: d.points,
            use_math: d.use_math,
          })),
        }),
      })
      const failedIndices = new Set(res.errors.map((e) => e.index))
      const succeededIds = new Set(
        toSave.filter((_, i) => !failedIndices.has(i)).map((d) => d.id),
      )
      setDrafts((prev) => {
        const remaining = prev.filter((d) => !succeededIds.has(d.id))
        saveDraftQuestions(remaining)
        return remaining
      })
      const skippedNote = incomplete.length ? ` (${incomplete.length} incomplete skipped)` : ""
      setImportResult(`Imported ${res.created_count} question(s).${skippedNote}`)
      if (res.errors.length) {
        const details = res.errors
          .slice(0, 3)
          .map((e) => `#${e.index + 1}: ${typeof e.detail === "string" ? e.detail : JSON.stringify(e.detail)}`)
          .join("; ")
        setError(
          `${res.errors.length} question(s) failed on the server${details ? `: ${details}` : ""}`,
        )
      }
    } catch (e) {
      setError((e as Error)?.message ?? "Import failed")
    } finally {
      setIsImporting(false)
    }
  }

  const approvedCount = drafts.filter((d) => d.approved).length
  const editing = drafts.find((d) => d.id === editingId)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to questions
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("Clear all draft extracted questions?")) {
              clearDraftQuestions()
              setDrafts([])
            }
          }}
        >
          Clear drafts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject for imported questions</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault()
              pickFile(e.dataTransfer.files?.[0])
            }}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-lg border-2 border-dashed border-border p-8 text-center hover:border-primary transition-colors"
          >
            <input
              type="file"
              accept=".pdf,.xlsx"
              className="hidden"
              id="pdf-import-file"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <label htmlFor="pdf-import-file" className="cursor-pointer block">
              <FileUp className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Click or drop PDF / Excel (.xlsx)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDFs are processed one page at a time with vision AI so formulas become LaTeX ($...$).
              </p>
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: <span className="font-medium text-foreground">{file.name}</span>
                </p>
              )}
            </label>
          </div>

          <Button onClick={startExtraction} disabled={!file || isFetching || !subjectId}>
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting…
              </>
            ) : (
              "Extract problems with AI"
            )}
          </Button>
        </CardContent>
      </Card>

      {isFetching && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Parsing file…</span>
              <span>
                {progressText} · {progress}%
              </span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={cancelExtraction}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(error || importResult) && (
        <Card className={error ? "border-destructive" : "border-green-600/40"}>
          <CardContent className="pt-6 text-sm">
            {importResult && <p className="text-green-700 dark:text-green-400">{importResult}</p>}
            {error && <p className="text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>2. Review extracted questions ({drafts.length})</CardTitle>
          <div className="text-sm text-muted-foreground">{approvedCount} approved</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedIds.size === drafts.length && drafts.length > 0
                ? "Deselect all"
                : "Select all"}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <Button size="sm" onClick={approveSelected}>
                  Approve selected ({selectedIds.size})
                </Button>
                <Button variant="destructive" size="sm" onClick={removeSelected}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove selected
                </Button>
              </>
            )}
            <Button
              className="ml-auto"
              disabled={approvedCount === 0 || isImporting}
              onClick={importApproved}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save {approvedCount} to question bank
            </Button>
          </div>

          {drafts.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No extracted questions yet. Upload a file and run extraction.
            </p>
          ) : (
            <div className="space-y-3">
              {drafts.map((d) => {
                const issue = draftValidationMessage(d)
                return (
                <Card key={d.id} className={issue ? "border-destructive/50" : "border-border"}>
                  <CardContent className="flex items-start gap-3 pt-4">
                    <Checkbox
                      checked={selectedIds.has(d.id)}
                      onCheckedChange={() => toggleSelect(d.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-medium ${d.approved ? "text-green-600" : "text-amber-600"}`}
                        >
                          {d.approved ? "Approved" : "Pending"}
                        </span>
                        {issue && (
                          <span className="text-xs text-destructive">Incomplete — {issue}</span>
                        )}
                      </div>
                      <div className="line-clamp-2 text-sm font-medium">
                        {d.use_math ? (
                          <MixedMathText text={d.question_text} />
                        ) : (
                          d.question_text
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {d.options.length} options · correct:{" "}
                        {d.correct_answers.map((i) => String.fromCharCode(65 + i)).join(", ") ||
                          "?"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(d.id)}>
                      Edit
                    </Button>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit draft question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Math (LaTeX)</p>
                <p className="text-xs text-muted-foreground">Wrap formulas in $...$</p>
              </div>
              <Switch
                checked={editing.use_math}
                onCheckedChange={(checked) => updateDraft(editing.id, { use_math: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label>Question text</Label>
              <Textarea
                value={editing.question_text}
                onChange={(e) => updateDraft(editing.id, { question_text: e.target.value })}
                rows={4}
              />
              {editing.use_math && editing.question_text.trim() && (
                <div className="rounded-md border bg-muted/30 p-2 text-sm">
                  <MixedMathText text={editing.question_text} />
                </div>
              )}
            </div>
            {editing.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-sm font-medium">{String.fromCharCode(65 + i)}</span>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const options = [...editing.options]
                    options[i] = e.target.value
                    updateDraft(editing.id, { options })
                  }}
                />
                <Checkbox
                  checked={editing.correct_answers.includes(i)}
                  onCheckedChange={(checked) => {
                    updateDraft(editing.id, {
                      correct_answers: checked ? [i] : [],
                      question_type: "single_choice",
                    })
                  }}
                />
                <span className="text-xs text-muted-foreground">Correct</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  updateDraft(editing.id, { approved: true })
                  setEditingId(null)
                }}
              >
                Approve & close
              </Button>
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
