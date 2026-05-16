"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@/i18n/navigation"

export function NarxozLandingClient() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const toggleMenu = useCallback(() => setMobileOpen((o) => !o), [])
  const closeMenu = useCallback(() => setMobileOpen(false), [])

  const toggleFaq = useCallback((index: number) => {
    setFaqOpen((prev) => (prev === index ? null : index))
  }, [])

  useEffect(() => {
    const id = "narxoz-landing-fonts"
    if (document.getElementById(id)) return
    const pre = document.createElement("link")
    pre.rel = "preconnect"
    pre.href = "https://fonts.googleapis.com"
    const link = document.createElement("link")
    link.id = id
    link.rel = "stylesheet"
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&display=swap"
    document.head.appendChild(pre)
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll(".card, .step, .step-4, .faq-item")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).style.opacity = "1"
            ;(e.target as HTMLElement).style.transform = "translateY(0)"
          }
        })
      },
      { threshold: 0.1 },
    )
    els.forEach((el) => {
      const h = el as HTMLElement
      h.style.opacity = "0"
      h.style.transform = "translateY(20px)"
      h.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="narxoz-landing" ref={rootRef}>
      <nav>
        <Link href="/" className="logo" onClick={closeMenu}>
          <span className="logo-main">
            NAR<span>X</span>OZ
          </span>
          <span className="logo-sub">U N I V E R S I T Y</span>
        </Link>

        <ul className="nav-links">
          <li>
            <a href="#features">Особенности</a>
          </li>
          <li>
            <a href="#promo">Акции</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>

        <Link href="/auth/login" className="btn-login">
          Войти
        </Link>

        <button type="button" className="hamburger" onClick={toggleMenu} aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div className={`mobile-menu${mobileOpen ? " open" : ""}`} id="mobileMenu">
        <a href="#features" onClick={closeMenu}>
          Особенности
        </a>
        <a href="#promo" onClick={closeMenu}>
          Акции
        </a>
        <a href="#faq" onClick={closeMenu}>
          FAQ
        </a>
        <Link href="/auth/login" onClick={closeMenu} style={{ color: "var(--red)", fontWeight: 700 }}>
          Войти / Регистрация
        </Link>
      </div>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-badge">🎯 Пробное ЕНТ онлайн для 10–11 классов</span>
          <h1>Проверь свою готовность к ЕНТ 2026: пройди пробный тест и узнай результат!</h1>
          <ul className="hero-features">
            <li>Максимальное погружение в экзамен с актуальной базой вопросов.</li>
            <li>Симулятор реального ЕНТ: интерфейс и тайминг «один в один».</li>
            <li>Экспертная база актуальных вопросов 2025–2026</li>
            <li>Индивидуальный Roadmap: анализ ошибок и стратегия подготовки.</li>
          </ul>
          <p className="hero-price">Пробный онлайн ЕНТ — всего 1 000 ₸</p>
          <p className="hero-price-sub">Узнай свой реальный балл и слабые места.</p>
          <Link href="/auth/sign-up" className="btn-primary">
            Пройти регистрацию
          </Link>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">🎓</div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-inner">
          <h2 className="section-title">Твоя генеральная репетиция ЕНТ</h2>
          <p className="section-sub">
            Мы воссоздали условия реального тестирования, чтобы на самом экзамене ты чувствовал себя как дома.
          </p>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">⭐</div>
              <h3>Актуальная база 2025–2026</h3>
              <p>
                Забудь про устаревшие вопросы. Ты тренируешься на заданиях, которые соответствуют последним
                изменениям центра тестирования.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">⏱️</div>
              <h3>Идентичный интерфейс и регламент времени</h3>
              <p>
                Программная среда тренажера, логика навигации и система контроля времени (таймер) полностью
                дублируют реальный экзамен.
              </p>
            </div>
            <div className="card">
              <div className="card-icon">🛡️</div>
              <h3>Система прокторинга и контроля</h3>
              <p>
                Прокторинг исключает возможность подсказок, приучая тебя к дисциплине реального экзамена. Ты
                получаешь объективный балл.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="why" id="promo">
        <div className="why-image-placeholder">👩‍🎓</div>
        <div>
          <span className="why-badge">Почему пробное ЕНТ необходимо</span>
          <ul className="why-list">
            <li>
              📊{" "}
              <span>
                <strong>Стресс-тест и тайм-менеджмент</strong> — тренируете скорость и распределение времени в
                реальном формате.
              </span>
            </li>
            <li>
              🎯{" "}
              <span>
                <strong>Стратегия баллов</strong> — понимаете, какие предметы/подтемы выгоднее «добрать» первыми.
              </span>
            </li>
            <li>
              🔄{" "}
              <span>
                <strong>Привычка к процедуре</strong> — интерфейс, правила, таймер — без сюрпризов в день экзамена.
              </span>
            </li>
            <li>
              📈{" "}
              <span>
                <strong>Статистика по попыткам</strong> — виден эффект от каждой недели подготовки.
              </span>
            </li>
            <li>
              💡{" "}
              <span>
                <strong>Экономия</strong> — точечно закрываете пробелы вместо бесконечных общих занятий.
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="how">
        <div className="how-inner">
          <h2 className="section-title">Как это работает?</h2>
          <p className="section-sub">Пройди тест и узнай свой реальный итоговый балл.</p>
          <div className="steps-row">
            <div className="step">
              <div className="step-num">1</div>
              <p>Сдача теста</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">2</div>
              <p>Анализ ответов</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-num">3</div>
              <p>Готовый результат</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing" id="payment">
        <h2 className="section-title">Узнай свой реальный балл за 1 000 ₸</h2>
        <p className="section-sub">Всего 4 шага до старта</p>
        <div className="pricing-card">
          <div className="pricing-price">1 000 ₸</div>
          <p className="pricing-desc">Полный доступ к симуляции реального ЕНТ</p>

          <div className="steps-4">
            <div className="step-4">
              <div className="step-4-num">1</div>
              <p>
                <strong>Регистрация.</strong> Создайте аккаунт на сайте всего за 1 минуту
              </p>
            </div>
            <div className="step-4">
              <div className="step-4-num">2</div>
              <p>
                <strong>Личный кабинет.</strong> Перейдите в раздел оплаты в своём профиле
              </p>
            </div>
            <div className="step-4">
              <div className="step-4-num">3</div>
              <p>
                <strong>Оплата по QR.</strong> Пополните баланс мгновенно через Kaspi или любой банк
              </p>
            </div>
            <div className="step-4">
              <div className="step-4-num">4</div>
              <p>
                <strong>Старт.</strong> Начните симуляцию ЕНТ сразу после подтверждения платежа
              </p>
            </div>
          </div>

          <p className="pricing-tip">
            Удобно: Вы можете пополнить баланс на любую сумму. Средства в личном кабинете не сгорают — используйте их
            для тренировок в любое удобное время.
          </p>

          <div className="includes-list">
            <span className="include-pill">интерфейс как на реальном ЕНТ</span>
            <span className="include-pill">актуальные вопросы 2025–2026</span>
            <span className="include-pill">Личный кабинет с историей попыток</span>
          </div>

          <p className="pricing-note">
            • Автопродления нет. Отменять ничего не нужно. &nbsp;•&nbsp; Кому подойдёт: 10–11 классы
          </p>

          <Link href="/auth/sign-up" className="btn-primary">
            Пройти регистрацию
          </Link>
        </div>
      </section>

      <section className="faq" id="faq">
        <div className="faq-inner">
          <h2 className="section-title">Часто задаваемые вопросы</h2>
          <p className="section-sub">Если не нашли ответ — напишите нам.</p>

          {[
            {
              q: "Что такое пробное ЕНТ и чем оно полезно?",
              a: "Пробное ЕНТ — это симуляция реального экзамена с актуальными вопросами. Оно помогает понять текущий уровень и составить план подготовки.",
            },
            {
              q: "Оплата распространяется на один раз сдачи пробного ЕНТ?",
              a: "Да, каждая попытка оплачивается отдельно. Вы можете пополнить баланс заранее и использовать средства в любое удобное время.",
            },
            {
              q: "Вопросы соответствуют 2025–2026 учебному году?",
              a: "Да, база вопросов регулярно обновляется и соответствует последним изменениям центра тестирования на 2025–2026 год.",
            },
            {
              q: "Когда я получу результаты?",
              a: "Результаты доступны сразу после завершения теста. В личном кабинете вы увидите детальный анализ ответов и свой итоговый балл.",
            },
            {
              q: "Как происходит оплата?",
              a: "Оплата производится через QR-код по Kaspi Pay или любым другим банком. Деньги зачисляются мгновенно на ваш личный кабинет.",
            },
          ].map((item, index) => (
            <div key={item.q} className={`faq-item${faqOpen === index ? " open" : ""}`}>
              <button type="button" className="faq-q" onClick={() => toggleFaq(index)}>
                {item.q}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-main">
                NAR<span>X</span>OZ
              </span>
              <span className="logo-sub">U N I V E R S I T Y</span>
            </div>
            <p>
              Онлайн-платформа для подготовки к ЕНТ с актуальными вопросами, детальным анализом результатов и
              персональным планом обучения. Готовься эффективно и поступай на грант!
            </p>
          </div>
          <div className="footer-col">
            <h4>Навигация</h4>
            <ul>
              <li>
                <a href="#home">Главная</a>
              </li>
              <li>
                <a href="#features">Особенности</a>
              </li>
              <li>
                <a href="#promo">Преимущества</a>
              </li>
              <li>
                <a href="#payment">Оплата</a>
              </li>
              <li>
                <a href="#faq">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Свяжитесь с нами</h4>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <a href="tel:+77773478899">+7 777 347 88 99</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📸</span>
              <a href="#">@narxozkz</a>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏫</span>
              <span>Narxoz University</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <a href="mailto:admission@narxoz.kz">admission@narxoz.kz</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Narxoz University. Все права защищены.</div>
      </footer>
    </div>
  )
}
