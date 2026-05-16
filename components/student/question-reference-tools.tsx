"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calculator, Grid3x3 } from "lucide-react"
import { EngineeringCalculator } from "@/components/student/engineering-calculator"
import { PeriodicTableViewer } from "@/components/student/periodic-table-viewer"

type Props = {
  showCalculator: boolean
  showPeriodicTable: boolean
}

export function QuestionReferenceTools({ showCalculator, showPeriodicTable }: Props) {
  const [calcOpen, setCalcOpen] = useState(false)
  const [tableOpen, setTableOpen] = useState(false)

  if (!showCalculator && !showPeriodicTable) return null

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
        {showCalculator ? (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setCalcOpen(true)}>
            <Calculator className="h-4 w-4" />
            Calculator
          </Button>
        ) : null}
        {showPeriodicTable ? (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setTableOpen(true)}>
            <Grid3x3 className="h-4 w-4" />
            Periodic table
          </Button>
        ) : null}
      </div>

      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Engineering calculator</DialogTitle>
            <DialogDescription className="text-xs">
              Scientific expressions: trig, logs, powers, roots, and constants. Use <code className="rounded bg-muted px-1">deg(…)</code>{" "}
              inside trig for degrees (e.g. <code className="rounded bg-muted px-1">sin(deg(90))</code>).
            </DialogDescription>
          </DialogHeader>
          <EngineeringCalculator />
        </DialogContent>
      </Dialog>

      <PeriodicTableViewer open={tableOpen} onOpenChange={setTableOpen} />
    </>
  )
}
