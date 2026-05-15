"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { BrandLogo } from "@/components/brand-logo"
import { XPatternBackdrop } from "@/components/x-pattern-backdrop"
import { Link as IntlLink } from "@/i18n/navigation"

export default function AuthErrorPage() {
  const t = useTranslations("Auth")

  return (
    <XPatternBackdrop>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <LocaleSwitcher />
            </div>
            <IntlLink href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <BrandLogo size={32} className="object-contain shrink-0 h-8 w-8" />
              <span className="text-xl font-bold text-foreground">{t("brand")}</span>
            </IntlLink>
            <CardTitle className="text-2xl text-destructive">{t("errorGeneric")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="default" className="w-full">
              <IntlLink href="/auth/login">{t("loginLink")}</IntlLink>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <IntlLink href="/">{t("brand")}</IntlLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </XPatternBackdrop>
  )
}
