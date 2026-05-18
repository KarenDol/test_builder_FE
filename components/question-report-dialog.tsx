"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { apiClientJson, ApiError } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { QuestionReportReason } from "@/lib/types"

const REASONS: QuestionReportReason[] = [
  "no_correct_option",
  "mistake_in_question",
  "wrong_correct_answer",
  "unclear_wording",
  "other",
]

export function QuestionReportDialog({
  open,
  onOpenChange,
  submissionId,
  questionId,
  questionNumber,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  questionId: string
  questionNumber: number
  onSuccess: () => void
}) {
  const t = useTranslations("QuestionReport")
  const [reason, setReason] = useState<QuestionReportReason>("no_correct_option")
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (reason === "other" && !comment.trim()) {
      setError(t("commentRequired"))
      return
    }
    setSaving(true)
    setError("")
    try {
      await apiClientJson(`/submissions/${submissionId}/question-reports`, {
        method: "POST",
        body: JSON.stringify({
          question_id: questionId,
          reason,
          comment: comment.trim() || null,
        }),
      })
      setComment("")
      setReason("no_correct_option")
      onOpenChange(false)
      onSuccess()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t("submitFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title", { n: questionNumber })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label>{t("reasonLabel")}</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as QuestionReportReason)}
              className="gap-2"
            >
              {REASONS.map((key) => (
                <div key={key} className="flex items-start gap-2">
                  <RadioGroupItem value={key} id={`reason-${key}`} className="mt-0.5" />
                  <Label htmlFor={`reason-${key}`} className="cursor-pointer font-normal leading-snug">
                    {t(`reasons.${key}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-comment">
              {reason === "other" ? t("commentRequiredLabel") : t("commentOptionalLabel")}
            </Label>
            <Textarea
              id="report-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={3}
              maxLength={2000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? t("submitting") : t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
