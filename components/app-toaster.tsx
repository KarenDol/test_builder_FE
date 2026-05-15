"use client"

import { Toaster } from "sonner"

/** Fixed theme — avoids `useTheme` when `ThemeProvider` is not mounted. */
export function AppToaster() {
  return (
    <Toaster
      theme="light"
      richColors
      position="top-center"
      closeButton
      duration={5000}
      className="z-[200]"
    />
  )
}
