"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

/** Decorative red X marks — positions tuned to stay mostly at the edges (see ref layout). */
const MARKS = [
  { cls: "top-[3%] left-[-2%]", size: 72, rotate: -14, opacity: 0.3, scale: 1 },
  { cls: "top-[5%] right-[0%]", size: 92, rotate: 20, opacity: 0.36, scale: 1 },
  { cls: "top-[18%] left-[2%]", size: 52, rotate: 32, opacity: 0.22, scale: 1 },
  { cls: "top-[12%] right-[18%]", size: 44, rotate: -38, opacity: 0.18, scale: 1 },
  { cls: "top-[40%] left-[-3%]", size: 48, rotate: 18, opacity: 0.2, scale: 1 },
  { cls: "top-[44%] right-[-2%]", size: 58, rotate: -26, opacity: 0.22, scale: 1 },
  { cls: "bottom-[36%] left-[1%]", size: 76, rotate: 12, opacity: 0.28, scale: 1.05 },
  { cls: "bottom-[32%] right-[2%]", size: 88, rotate: -10, opacity: 0.32, scale: 1 },
  { cls: "bottom-[10%] left-[4%]", size: 96, rotate: 8, opacity: 0.3, scale: 1 },
  { cls: "bottom-[6%] right-[-3%]", size: 78, rotate: -22, opacity: 0.28, scale: 1 },
  { cls: "top-[28%] left-[8%]", size: 36, rotate: -42, opacity: 0.14, scale: 1 },
  { cls: "top-[30%] right-[10%]", size: 40, rotate: 24, opacity: 0.14, scale: 1 },
] as const

type XPatternBackdropProps = {
  children: React.ReactNode
  className?: string
}

export function XPatternBackdrop({ children, className }: XPatternBackdropProps) {
  return (
    <div className={cn("relative min-h-screen overflow-x-hidden bg-background", className)}>
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        {MARKS.map((m, i) => (
          <div
            key={i}
            className={cn("absolute", m.cls)}
            style={{
              width: m.size,
              height: m.size,
              opacity: m.opacity,
              transform: `rotate(${m.rotate}deg) scale(${m.scale})`,
              filter: "drop-shadow(0 4px 10px rgba(196, 18, 51, 0.22))",
            }}
          >
            <Image
              src="/x-pattern.png"
              alt=""
              width={128}
              height={128}
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
