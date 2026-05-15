import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppToaster } from '@/components/app-toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin", "cyrillic"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EduTest by Narxoz',
  description:
    'EduTest by Narxoz — пробные тесты и подготовка к экзаменам для студентов и преподавателей.',
  generator: 'v0.app',
  icons: {
    icon: "/x-pattern.png",
    apple: "/x-pattern.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="bg-background">
      <body className="font-sans antialiased min-h-screen">
        {children}
        <AppToaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
