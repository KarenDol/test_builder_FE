"use client"

import { createElement, useEffect, useRef } from "react"
import type { MathfieldElement } from "mathlive"
import "mathlive"
import "mathlive/fonts.css"

export type MathLiveFieldProps = {
  value: string
  onChange: (latex: string) => void
  readOnly?: boolean
  className?: string
}

/** MathLive math-field: assemble expressions (fractions, roots, etc.). Plain sentences belong in a separate textarea. */
export function MathLiveField({ value, onChange, readOnly, className }: MathLiveFieldProps) {
  const ref = useRef<MathfieldElement | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.readOnly = Boolean(readOnly)
    el.mathModeSpace = "\\:"
    el.defaultMode = "inline-math"
    el.smartMode = false
  }, [readOnly])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (ev: Event) => {
      const t = ev.target as MathfieldElement
      onChangeRef.current(t.value)
    }
    el.addEventListener("input", handler)
    return () => el.removeEventListener("input", handler)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.value !== value) el.value = value
  }, [value])

  return createElement("math-field", {
    ref,
    className,
    style: {
      width: "100%",
      minHeight: readOnly ? "2.25rem" : "2.75rem",
      fontSize: "1.125rem",
    },
  })
}
