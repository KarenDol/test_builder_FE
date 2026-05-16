"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

const PERIODIC_TABLE_SRC = "/periodic_table.png"
const DEFAULT_ZOOM = 1
const MIN_ZOOM = 0.5
const MAX_ZOOM = 2

export function PeriodicTableViewer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const panRef = useRef({ active: false, x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

  const measureViewport = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setViewportWidth(el.clientWidth)
  }, [])

  useEffect(() => {
    if (!open) return
    measureViewport()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(measureViewport)
    ro.observe(el)
    return () => ro.disconnect()
  }, [open, measureViewport])

  useEffect(() => {
    if (!open) setZoom(DEFAULT_ZOOM)
  }, [open])

  const imageWidthPx = viewportWidth > 0 ? Math.round(viewportWidth * zoom) : undefined

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (!el || e.button !== 0) return
    el.setPointerCapture(e.pointerId)
    panRef.current = {
      active: true,
      x: e.clientX,
      y: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    }
    setIsPanning(true)
    e.preventDefault()
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!panRef.current.active) return
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = panRef.current.scrollLeft - (e.clientX - panRef.current.x)
    el.scrollTop = panRef.current.scrollTop - (e.clientY - panRef.current.y)
  }

  const endPan = (e: React.PointerEvent) => {
    const el = scrollRef.current
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
    panRef.current.active = false
    setIsPanning(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[min(94vw,720px)] max-w-[720px] flex-col gap-3 overflow-hidden p-4 sm:max-w-[720px]">
        <DialogHeader className="shrink-0 space-y-0">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle>Periodic table</DialogTitle>
              <DialogDescription className="text-xs">
                Drag to pan. Use +/− to zoom, or scroll with trackpad or mouse wheel.
              </DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.1) * 100) / 100))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[3.25rem] text-center text-xs font-medium tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.1) * 100) / 100))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Reset zoom"
                onClick={() => setZoom(DEFAULT_ZOOM)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          ref={scrollRef}
          role="region"
          aria-label="Periodic table chart"
          className={cn(
            "h-[min(52vh,440px)] w-full overflow-auto rounded-md border bg-muted/20",
            isPanning ? "cursor-grabbing" : "cursor-grab",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
          <img
            src={PERIODIC_TABLE_SRC}
            alt="Periodic table of the elements"
            draggable={false}
            onLoad={measureViewport}
            style={imageWidthPx ? { width: imageWidthPx, maxWidth: "none", height: "auto" } : { width: "100%", height: "auto" }}
            className="block max-w-none select-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
