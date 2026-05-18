"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft } from "lucide-react"
import {
  SubmissionResultReview,
  type SubmissionDetail,
} from "@/components/submission-result-review"

export default function StudentResultIdBody() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("StudentResults")
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmission()
  }, [params.id])

  async function fetchSubmission() {
    try {
      const data = await apiClientJson<SubmissionDetail>(`/submissions/${params.id}`)
      setSubmission(data)
    } catch {
      router.push("/student/results")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!submission || !submission.tests) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold">{t("notFound")}</h2>
        <Button asChild className="mt-4">
          <Link href="/student/results">{t("backToResults")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start gap-5 md:gap-6">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link href="/student/results">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
            {submission.tests.title}
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">{t("detailSubtitle")}</p>
        </div>
      </div>

      <SubmissionResultReview
        submission={submission}
        allowReport
        onReportSubmitted={fetchSubmission}
      />

      <div className="flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/student/results">{t("backToResults")}</Link>
        </Button>
        <Button asChild>
          <Link href="/student/tests">{t("takeAnother")}</Link>
        </Button>
      </div>
    </div>
  )
}
