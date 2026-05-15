"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, BarChart3, Clock, CheckCircle2, GraduationCap } from "lucide-react"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { BrandLogo } from "@/components/brand-logo"

export default function LandingPage() {
  const t = useTranslations("Landing")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size={32} className="object-contain shrink-0 h-8 w-8" priority />
            <span className="text-xl font-bold text-foreground">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost">{t("login")}</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>{t("getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            {t("heroTitle")}{" "}
            <span className="text-primary">{t("heroHighlight")}</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto px-8">
                {t("ctaStudent")}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                {t("ctaStaffLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">{t("featuresTitle")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<BookOpen className="h-6 w-6" />} title={t("feature1Title")} description={t("feature1Desc")} />
            <FeatureCard icon={<Clock className="h-6 w-6" />} title={t("feature2Title")} description={t("feature2Desc")} />
            <FeatureCard icon={<BarChart3 className="h-6 w-6" />} title={t("feature3Title")} description={t("feature3Desc")} />
            <FeatureCard icon={<Users className="h-6 w-6" />} title={t("feature4Title")} description={t("feature4Desc")} />
            <FeatureCard icon={<CheckCircle2 className="h-6 w-6" />} title={t("feature5Title")} description={t("feature5Desc")} />
            <FeatureCard icon={<GraduationCap className="h-6 w-6" />} title={t("feature6Title")} description={t("feature6Desc")} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t("cta2Title")}</h2>
          <p className="text-muted-foreground mb-8">{t("cta2Subtitle")}</p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="px-8">
              {t("cta2Button")}
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size={24} className="object-contain shrink-0 h-6 w-6" />
            <span className="font-semibold text-foreground">{t("brand")}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t("footerTagline")}</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}
