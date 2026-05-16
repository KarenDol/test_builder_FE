"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Renders plain text with inline LaTeX segments delimited as usual for MathLive
 * (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`).
 */
export function MixedMathText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = text
    let cancelled = false
    void import("mathlive").then((ml) => {
      if (cancelled || !ref.current) return
      ml.renderMathInElement(ref.current, {
        TeX: {
          delimiters: {
            inline: [
              ["\\(", "\\)"],
              ["$", "$"],
            ],
            display: [
              ["$$", "$$"],
              ["\\[", "\\]"],
            ],
          },
        },
      })
    })
    return () => {
      cancelled = true
    }
  }, [text])

  return (
    <div
      ref={ref}
      className={cn(
        "min-h-6 text-lg font-medium leading-relaxed text-foreground [&_.ML__is-inline]:inline-block [&_.ML__is-inline]:align-middle",
        className,
      )}
    />
  )
}
