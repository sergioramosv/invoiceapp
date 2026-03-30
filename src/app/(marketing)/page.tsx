'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/FadeIn'

/* ───────────────────────────── Icons (inline SVG) ───────────────────────────── */

function IconEditor() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
function IconCurrency() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M15 9.354a4 4 0 1 0 0 5.292" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  )
}
function IconPdf() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
function IconTemplate() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )
}
function IconLanguage() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-danger shrink-0">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 text-text-muted shrink-0 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ───────────────────────────── FAQ Accordion Item ───────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-base font-medium text-text">{question}</span>
        <IconChevron open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

/* ───────────────────────────── Main Page ───────────────────────────── */

export default function LandingPage() {
  const features = [
    { icon: <IconEditor />, title: 'Editor inteligente', desc: 'Preview en tiempo real mientras editas. Lo que ves es lo que obtienes.' },
    { icon: <IconCurrency />, title: 'Multi-moneda', desc: '20+ monedas soportadas. Cambia con un clic entre EUR, USD, GBP y más.' },
    { icon: <IconPdf />, title: 'PDF profesional', desc: 'Descarga instantánea en PDF, listo para enviar a tu cliente.' },
    { icon: <IconTemplate />, title: 'Templates', desc: 'Guarda y reutiliza tus diseños favoritos para facturar más rápido.' },
    { icon: <IconLanguage />, title: 'Multi-idioma', desc: 'Crea facturas en español, inglés y alemán. Perfecto para clientes internacionales.' },
    { icon: <IconShield />, title: 'Datos seguros', desc: 'Cifrado end-to-end y cumplimiento total con GDPR. Tu privacidad es prioridad.' },
  ]

  const comparisonWith = [
    'Preview en tiempo real',
    'PDF en 1 clic',
    'Multi-moneda',
    'Templates reutilizables',
    'Pago único',
    'Sin marca de agua (pro)',
  ]
  const comparisonWithout = [
    'Editar a ciegas',
    'Exportar y rezar',
    'Solo tu moneda',
    'Empezar de cero cada vez',
    'Suscripción mensual',
    'Marca de agua fea',
  ]

  const testimonials = [
    { text: 'InvoiceApp me ahorra horas cada semana. El editor es rapidísimo.', name: 'Laura M.', role: 'Diseñadora freelance', color: 'bg-primary' },
    { text: 'Por fin una herramienta de facturación que no parece de los 90.', name: 'Carlos R.', role: 'CEO de StartupXYZ', color: 'bg-success' },
    { text: 'El pago único fue lo que me convenció. Sin suscripciones, sin sorpresas.', name: 'Ana S.', role: 'Consultora', color: 'bg-warning' },
  ]

  const faqs = [
    { q: '¿Es realmente gratis para empezar?', a: 'Sí, puedes crear facturas gratis con watermark. Para eliminar el watermark, adquiere la licencia Pro.' },
    { q: '¿Qué incluye el plan Pro?', a: 'Acceso de por vida, sin watermark, templates ilimitados, export multi-formato y soporte prioritario.' },
    { q: '¿Mis datos están seguros?', a: 'Absolutamente. Usamos Firebase con cifrado y cumplimos con GDPR.' },
    { q: '¿Puedo cambiar la moneda de mis facturas?', a: 'Sí, soportamos más de 20 monedas internacionales.' },
    { q: '¿Necesito instalar algo?', a: 'No, InvoiceApp funciona 100% en el navegador. También puedes instalarlo como PWA.' },
  ]

  const steps = [
    { num: '01', title: 'Crea tu factura', desc: 'Rellena los datos de tu empresa y cliente' },
    { num: '02', title: 'Personaliza', desc: 'Elige moneda, idioma y añade tu logo' },
    { num: '03', title: 'Descarga', desc: 'PDF profesional listo en un clic' },
  ]

  const proFeatures = [
    'Sin watermark',
    'Templates ilimitados',
    'Export PDF + PNG',
    'Soporte prioritario',
    'Actualizaciones de por vida',
  ]

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light/10 via-surface to-surface" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Ya disponible
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text tracking-tight leading-tight">
              Crea facturas profesionales{' '}
              <span className="text-primary">en segundos</span>
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
              El generador de facturas más rápido y elegante. Sin complicaciones, sin suscripciones mensuales. Pago único, acceso de por vida.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors text-center shadow-lg shadow-primary/25"
              >
                Empezar gratis
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-3.5 border border-border text-text rounded-xl font-medium hover:bg-surface-tertiary transition-colors text-center"
              >
                Ver demo
              </a>
            </div>
          </FadeIn>

          {/* App mockup */}
          <FadeIn className="mt-16 md:mt-20" delay={200}>
            <div id="demo" className="relative mx-auto max-w-4xl">
              <div className="rounded-2xl border border-border bg-white shadow-2xl shadow-black/5 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-secondary border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-danger/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <div className="ml-4 flex-1 h-6 bg-surface-tertiary rounded-md" />
                </div>
                {/* Mock editor */}
                <div className="grid md:grid-cols-2 min-h-[340px]">
                  {/* Left: form */}
                  <div className="p-6 space-y-4 border-r border-border">
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-surface-tertiary rounded" />
                      <div className="h-9 bg-surface-secondary rounded-lg border border-border" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="h-3 w-12 bg-surface-tertiary rounded" />
                        <div className="h-9 bg-surface-secondary rounded-lg border border-border" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-14 bg-surface-tertiary rounded" />
                        <div className="h-9 bg-surface-secondary rounded-lg border border-border" />
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 bg-surface-tertiary rounded" />
                        <div className="h-3 w-10 bg-surface-tertiary rounded" />
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between">
                        <div className="h-3 w-28 bg-text-muted/20 rounded" />
                        <div className="h-3 w-14 bg-text-muted/20 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 w-24 bg-text-muted/20 rounded" />
                        <div className="h-3 w-12 bg-text-muted/20 rounded" />
                      </div>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <div className="h-9 flex-1 bg-primary rounded-lg" />
                      <div className="h-9 w-9 bg-surface-tertiary rounded-lg border border-border" />
                    </div>
                  </div>
                  {/* Right: preview */}
                  <div className="p-6 bg-surface-secondary">
                    <div className="bg-white rounded-lg border border-border p-5 shadow-sm h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="h-5 w-28 bg-primary/20 rounded mb-1" />
                          <div className="h-2.5 w-20 bg-surface-tertiary rounded" />
                        </div>
                        <div className="text-right">
                          <div className="h-4 w-16 bg-primary rounded text-[8px] text-white font-bold flex items-center justify-center">FACTURA</div>
                          <div className="h-2 w-14 bg-surface-tertiary rounded mt-1" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-2 w-full bg-surface-tertiary rounded" />
                        <div className="h-2 w-3/4 bg-surface-tertiary rounded" />
                      </div>
                      <div className="h-px bg-border my-3" />
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <div className="h-2 w-32 bg-surface-tertiary rounded" />
                          <div className="h-2 w-12 bg-surface-tertiary rounded" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-2 w-24 bg-surface-tertiary rounded" />
                          <div className="h-2 w-10 bg-surface-tertiary rounded" />
                        </div>
                      </div>
                      <div className="h-px bg-border my-3" />
                      <div className="flex justify-between">
                        <div className="h-3 w-10 bg-text/20 rounded font-bold" />
                        <div className="h-3 w-16 bg-primary/30 rounded font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Social Proof Bar ─── */}
      <section className="py-12 border-y border-border bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-center text-sm text-text-muted mb-8">
              Más de 2,000 profesionales confían en InvoiceApp
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['Freelancers', 'Agencias', 'Startups', 'Consultoras', 'Abogados'].map((name) => (
                <span key={name} className="text-lg font-semibold text-text-muted/50 tracking-wide">
                  {name}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Todo lo que necesitas para facturar
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Herramientas potentes, interfaz simple. Diseñado para que factures en menos tiempo.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i < 3 ? i * 100 : (i - 3) * 100} className="group">
                <div className="h-full p-6 rounded-2xl border border-border bg-white hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Cómo funciona
            </h2>
            <p className="mt-4 text-text-secondary">
              Tres pasos. Menos de un minuto.
            </p>
          </FadeIn>

          <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-border" />

            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 200} className="relative text-center">
                <div className="relative z-10 w-28 h-28 rounded-full bg-white border-2 border-border mx-auto flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-primary">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              ¿Por qué InvoiceApp?
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="grid md:grid-cols-2 gap-6">
              {/* With */}
              <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-8">
                <h3 className="text-lg font-semibold text-text mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <IconCheck />
                  </span>
                  Con InvoiceApp
                </h3>
                <ul className="space-y-4">
                  {comparisonWith.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-text">
                      <IconCheck />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Without */}
              <div className="rounded-2xl border border-border bg-surface-secondary p-8">
                <h3 className="text-lg font-semibold text-text-secondary mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center">
                    <IconX />
                  </span>
                  Sin InvoiceApp
                </h3>
                <ul className="space-y-4">
                  {comparisonWithout.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                      <IconX />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Precio simple, sin sorpresas
            </h2>
            <p className="mt-4 text-text-secondary">
              Un solo pago. Acceso de por vida. Sin trucos.
            </p>
          </FadeIn>

          <FadeIn className="max-w-md mx-auto">
            <div className="relative rounded-2xl border-2 border-primary bg-white p-8 shadow-xl shadow-primary/10">
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full">
                  Pro — Lifetime
                </span>
              </div>

              <div className="text-center mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-text">29€</span>
                  <span className="text-text-muted line-through">49€</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">pago único</p>
              </div>

              <ul className="mt-8 space-y-4">
                {proFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-text">
                    <IconCheck />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-8 block w-full py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors text-center shadow-lg shadow-primary/25"
              >
                Empezar ahora
              </Link>
            </div>
            <p className="text-center mt-6 text-sm text-text-muted">
              Empieza gratis — sin tarjeta de crédito
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Lo que dicen nuestros usuarios
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <div className="h-full p-6 rounded-2xl border border-border bg-white hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <IconStar key={j} />
                    ))}
                  </div>
                  <p className="text-sm text-text leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-semibold`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Preguntas frecuentes
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
              {faqs.map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              ¿Listo para facturar como un profesional?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Únete a miles de freelancers y empresas que ya usan InvoiceApp
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-block px-8 py-3.5 bg-white text-primary font-medium rounded-xl hover:bg-white/90 transition-colors shadow-lg"
            >
              Crear cuenta gratis
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
