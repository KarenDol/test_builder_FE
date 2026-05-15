'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { BrandLogo } from '@/components/brand-logo'
import { getPublicApiBase } from '@/lib/public-api'

function formatDetail(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  return fallback
}

function VerifyEmailInner() {
  const t = useTranslations('Auth')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [phase, setPhase] = useState<'loading' | 'ok' | 'err'>('loading')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setPhase('err')
      setErrMsg(t('verifyEmailInvalid'))
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const base = getPublicApiBase()
        const res = await fetch(`${base}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const raw = await res.text()
        if (cancelled) return
        if (!res.ok) {
          let msg = t('verifyEmailInvalid')
          try {
            const j = JSON.parse(raw) as { detail?: unknown }
            msg = formatDetail(j.detail, msg)
          } catch {
            /* keep */
          }
          setErrMsg(msg)
          setPhase('err')
          return
        }
        setPhase('ok')
      } catch {
        if (!cancelled) {
          setErrMsg(t('errorGeneric'))
          setPhase('err')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, t])

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <BrandLogo size={32} className="object-contain shrink-0 h-8 w-8" />
          <span className="text-xl font-bold text-foreground">{t('brand')}</span>
        </Link>
        {phase === 'loading' ? (
          <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 py-4">
            <Spinner className="h-8 w-8" />
            <CardDescription>{t('verifyEmailWorking')}</CardDescription>
          </div>
        ) : null}
        {phase === 'ok' ? (
          <>
            <CardTitle className="text-2xl">{t('verifyEmailSuccess')}</CardTitle>
            <CardDescription className="text-base">{t('verifyEmailSuccessLogin')}</CardDescription>
          </>
        ) : null}
        {phase === 'err' ? (
          <>
            <CardTitle className="text-2xl">{t('verifyEmailInvalid')}</CardTitle>
            {errMsg && errMsg !== t('verifyEmailInvalid') ? (
              <CardDescription className="text-base text-muted-foreground">{errMsg}</CardDescription>
            ) : null}
          </>
        ) : null}
      </CardHeader>
      {(phase === 'ok' || phase === 'err') && (
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/auth/login">{t('verifyEmailGoLogin')}</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <VerifyEmailInner />
      </Suspense>
    </div>
  )
}
