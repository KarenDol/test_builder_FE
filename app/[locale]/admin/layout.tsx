"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Spinner } from "@/components/ui/spinner"
import type { Profile } from "@/lib/types"

export default function AdminLayout({
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
        if (p.role !== "admin") {
          router.replace("/student")
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
      <AdminSidebar user={profile} />
      <main className="min-h-0 min-w-0 flex-1 bg-background">{children}</main>
    </div>
  )
}
