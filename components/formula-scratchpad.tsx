"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const MathLiveField = dynamic(
  () => import("@/components/math-live-field").then((m) => m.MathLiveField),
  {
    ssr: false,
    loading: () => <div className="h-11 w-full animate-pulse rounded-md bg-muted" />,
  },
)

/** Wraps raw LaTeX in `$...$` when not already delimited for inline/display TeX. */
export function wrapInlineMath(s: string): string {
  const t = s.trim()
  if (!t) return ""
  if ((t.startsWith("$") && t.endsWith("$")) || (t.startsWith("\\(") && t.endsWith("\\)"))) return t
  if (t.startsWith("\\[") && t.endsWith("\\]")) return t
  return `$${t}$`
}

export function FormulaScratchpad() {
  const [latex, setLatex] = useState("")

  const copyWithLatex = async () => {
    const raw = latex.trim()
    if (!raw) {
      toast.error("Build a formula first")
      return
    }
    try {
      await navigator.clipboard.writeText(wrapInlineMath(raw))
      toast.success("LaTeX copied ($…$)")
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border/80 bg-muted/15 p-3">
      <div>
        <p className="text-sm font-medium">Formula scratchpad</p>
        <p className="text-xs text-muted-foreground">
          Not saved. Build here, then use <span className="font-medium">Copy LaTeX</span> and paste into the
          question wording or any option.
        </p>
      </div>
      <MathLiveField
        value={latex}
        onChange={setLatex}
        className="min-h-[3rem] rounded-md border border-input bg-background px-2 py-1 shadow-sm"
      />
      <Button type="button" variant="secondary" size="sm" onClick={copyWithLatex}>
        Copy LaTeX
      </Button>
    </div>
  )
}
