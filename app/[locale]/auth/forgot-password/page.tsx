"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { BrandLogo } from "@/components/brand-logo"
import { XPatternBackdrop } from "@/components/x-pattern-backdrop"

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth")

  return (
    <XPatternBackdrop>
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex justify-center">
          <LocaleSwitcher />
        </div>
        <Link href="/" className="mb-8 flex justify-center">
          <BrandLogo
            width={220}
            height={64}
            className="h-14 w-auto max-w-[min(100%,240px)] object-contain"
            priority
          />
        </Link>
        <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 px-6 pt-6 text-left">
            <CardTitle className="text-2xl font-bold tracking-tight">{t("forgotPasswordTitle")}</CardTitle>
            <CardDescription className="text-base leading-relaxed">{t("forgotPasswordDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 px-6 pb-6">
            <Button asChild variant="default" className="w-full">
              <Link href="/auth/login">{t("backToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </XPatternBackdrop>
  )
}
