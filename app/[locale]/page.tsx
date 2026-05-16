import type { Metadata } from "next"
import { NarxozLandingClient } from "@/components/narxoz-landing-page"
import "./narxoz-landing.css"

export const metadata: Metadata = {
  title: "Narxoz University — Пробное ЕНТ",
  description:
    "Онлайн-платформа для подготовки к ЕНТ: пробный тест, актуальные вопросы и анализ результатов.",
}

export default function LandingPage() {
  return <NarxozLandingClient />
}
