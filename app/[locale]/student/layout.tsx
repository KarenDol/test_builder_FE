"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { StudentSidebar } from "@/components/student/student-sidebar"
import { Spinner } from "@/components/ui/spinner"
import type { Profile } from "@/lib/types"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await apiClientJson<Profile>("/auth/me")
        if (cancelled) return
        if (p.role === "admin") {
          router.replace("/admin")
          return
        }
        setProfile(p)
      } catch {
        router.replace("/auth/login")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <StudentSidebar user={profile} />
      <main className="min-h-0 flex-1 overflow-x-hidden bg-background px-6 py-8 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  )
}
