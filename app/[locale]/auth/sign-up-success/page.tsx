'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { BrandLogo } from '@/components/brand-logo'
import { Spinner } from '@/components/ui/spinner'

function SignUpSuccessInner() {
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const verify = searchParams.get('verify') === '1'

  if (!verify) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <BrandLogo size={32} className="object-contain shrink-0 h-8 w-8" />
            <span className="text-xl font-bold text-foreground">{t('brand')}</span>
          </Link>
          <CardTitle className="text-2xl">{t('signUpDoneTitle')}</CardTitle>
          <CardDescription className="text-base">{t('signUpDoneDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToLogin')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <BrandLogo size={32} className="object-contain shrink-0 h-8 w-8" />
          <span className="text-xl font-bold text-foreground">{t('brand')}</span>
        </Link>
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-accent" />
        </div>
        <CardTitle className="text-2xl">{t('signUpEmailVerifyTitle')}</CardTitle>
        <CardDescription className="text-base">{t('signUpEmailVerifyDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>{t('signUpEmailVerifyHint')}</p>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/auth/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToLogin')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <SignUpSuccessInner />
      </Suspense>
    </div>
  )
}
