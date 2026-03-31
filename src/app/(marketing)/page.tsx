'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeIn } from '@/components/ui/FadeIn'
import { useI18n } from '@/lib/i18n'

/* ───────────────────────────── Icons ───────────────────────────── */

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
      <polyline points="20 6 9 17 4 12" />
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
      className={`transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ───────────────────────────── Feature Icons ───────────────────────────── */

function IconShieldCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function IconPencil() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function IconLayout() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconArrowsConvert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function IconCode() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconQr() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <rect x="14" y="14" width="4" height="4" rx="0.5" />
      <line x1="22" y1="14" x2="22" y2="14.01" />
      <line x1="22" y1="18" x2="22" y2="22" />
      <line x1="18" y1="22" x2="18" y2="22.01" />
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

/* ───────────────────────────── Invoice Preview ───────────────────────────── */

const STATUS_CYCLE = [
  { label: 'Pagada', className: 'bg-success/10 text-success' },
  { label: 'Pendiente', className: 'bg-warning/10 text-warning' },
  { label: 'Enviada', className: 'bg-primary/10 text-primary' },
] as const

const TOTAL_CYCLE = ['10.164,00', '8.400,00', '12.936,00'] as const

function InvoicePreviewDemo() {
  const { t } = useI18n()
  const [statusIdx, setStatusIdx] = useState(0)
  const [totalIdx, setTotalIdx] = useState(0)

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_CYCLE.length)
    }, 3000)
    const totalTimer = setInterval(() => {
      setTotalIdx((prev) => (prev + 1) % TOTAL_CYCLE.length)
    }, 4000)
    return () => {
      clearInterval(statusTimer)
      clearInterval(totalTimer)
    }
  }, [])

  const currentStatus = STATUS_CYCLE[statusIdx]
  const currentTotal = TOTAL_CYCLE[totalIdx]

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto max-w-lg"
    >
      <div className="relative group">
        {/* Live preview badge */}
        <div className="absolute -top-3 -right-3 z-10 px-3 py-1 bg-text text-surface text-xs font-semibold rounded-full shadow-lg">
          {t('landing.livePreview')}
        </div>

        <div className="bg-surface rounded-2xl shadow-2xl border border-border p-8 md:p-10 transition-all duration-300 group-hover:shadow-3xl group-hover:scale-[1.02]">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-text rounded-full flex items-center justify-center text-surface font-bold text-sm">
                A
              </div>
              <div>
                <p className="font-bold text-text text-sm">ACME Studio</p>
                <p className="text-xs text-text-muted">Calle Gran Via 42, 28013 Madrid</p>
                <p className="text-xs text-text-muted">NIF: B12345678</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Factura</p>
              <p className="text-sm font-bold text-text mt-1">#INV-2026-047</p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentStatus.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${currentStatus.className}`}
                >
                  {currentStatus.label}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Bill to */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">Facturar a</p>
            <p className="text-sm font-medium text-text">TechCorp S.L.</p>
            <p className="text-xs text-text-muted">Av. Diagonal 123, 08028 Barcelona</p>
          </div>

          {/* Items table */}
          <div className="mb-6">
            <div className="grid grid-cols-12 gap-2 pb-3 border-b border-border">
              <p className="col-span-6 text-xs font-semibold text-text-muted uppercase tracking-widest">Concepto</p>
              <p className="col-span-2 text-xs font-semibold text-text-muted uppercase tracking-widest text-right">Cant.</p>
              <p className="col-span-2 text-xs font-semibold text-text-muted uppercase tracking-widest text-right">Precio</p>
              <p className="col-span-2 text-xs font-semibold text-text-muted uppercase tracking-widest text-right">Total</p>
            </div>
            {[
              { name: 'Diseno UI/UX', qty: 1, price: '2.400', total: '2.400' },
              { name: 'Desarrollo Frontend', qty: 1, price: '4.800', total: '4.800' },
              { name: 'Consultoria estrategica', qty: 1, price: '1.200', total: '1.200' },
            ].map((item) => (
              <div key={item.name} className="grid grid-cols-12 gap-2 py-3 border-b border-border-light">
                <p className="col-span-6 text-sm text-text">{item.name}</p>
                <p className="col-span-2 text-sm text-text-secondary text-right">{item.qty}</p>
                <p className="col-span-2 text-sm text-text-secondary text-right">{item.price}€</p>
                <p className="col-span-2 text-sm text-text font-medium text-right">{item.total}€</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 ml-auto max-w-[200px]">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text">8.400,00€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">IVA 21%</span>
              <span className="text-text">1.764,00€</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span className="text-text">Total</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTotal}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="text-text"
                >
                  {currentTotal}€
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────────────────────── Main Page ───────────────────────────── */

export default function LandingPage() {
  const { t } = useI18n()

  const FEATURES = [
    { icon: IconShieldCheck, title: t('landing.feat.verifactu.title'), desc: t('landing.feat.verifactu.desc') },
    { icon: IconPencil,      title: t('landing.feat.editor.title'),    desc: t('landing.feat.editor.desc') },
    { icon: IconLayout,      title: t('landing.feat.templates.title'), desc: t('landing.feat.templates.desc') },
    { icon: IconGlobe,       title: t('landing.feat.multicurrency.title'), desc: t('landing.feat.multicurrency.desc') },
    { icon: IconChart,       title: t('landing.feat.analytics.title'), desc: t('landing.feat.analytics.desc') },
    { icon: IconArrowsConvert, title: t('landing.feat.quotes.title'),  desc: t('landing.feat.quotes.desc') },
    { icon: IconCode,        title: t('landing.feat.api.title'),       desc: t('landing.feat.api.desc') },
    { icon: IconHeart,       title: t('landing.feat.opensource.title'), desc: t('landing.feat.opensource.desc') },
  ]

  const TECH_STACK = [
    { label: t('landing.tech.framework'), name: 'Next.js 16' },
    { label: t('landing.tech.ui'),        name: 'React 19' },
    { label: t('landing.tech.language'),  name: 'TypeScript' },
    { label: t('landing.tech.backend'),   name: 'Firebase' },
    { label: t('landing.tech.styles'),    name: 'Tailwind CSS 4' },
    { label: t('landing.tech.pdf'),       name: 'jsPDF' },
  ]

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-text tracking-tight leading-[1.1]">
              {t('landing.hero').split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br className="hidden sm:block" />}
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              {t('landing.heroSub')}
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                href="/demo"
                className="px-10 py-4 bg-text text-surface rounded-full font-medium hover:bg-text-secondary transition-colors text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('landing.demo')}
              </Link>
            </div>
          </FadeIn>

          {/* Invoice preview */}
          <div className="mt-16 md:mt-24">
            <InvoicePreviewDemo />
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.featuresTitle2')}
            </h2>
            <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
              {t('landing.featuresSubtitle2')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div className="h-full p-6 md:p-8 rounded-2xl border border-border bg-surface hover:shadow-lg hover:shadow-text/5 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-text mb-4">
                    <f.icon />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-text mb-2">{f.title}</h3>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VeriFactu Highlight ─── */}
      <section className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <FadeIn>
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-success/10 text-success mb-6">
                  {t('landing.verifactu.badge')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight mb-6">
                  {t('landing.verifactu.title')}
                </h2>
                <div className="space-y-4 text-text-secondary text-sm md:text-base leading-relaxed">
                  <p>{t('landing.verifactu.desc')}</p>
                  <ul className="space-y-3">
                    {(['check1', 'check2', 'check3', 'check4'] as const).map(k => (
                      <li key={k} className="flex items-start gap-3">
                        <IconCheck />
                        <span>{t(`landing.verifactu.${k}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-surface rounded-2xl border border-border p-8 shadow-lg">
                {/* VeriFactu status card */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <IconShieldCheck />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{t('landing.verifactu.status')}</p>
                      <p className="text-xs text-text-muted">INV-2026-047</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-success/10 text-success">
                    {t('landing.verifactu.accepted')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-secondary">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">{t('landing.verifactu.hashLabel')}</p>
                    <p className="text-xs text-text font-mono break-all">
                      a1b2c3d4e5f6...8f9a0b1c2d3e
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-secondary">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">{t('landing.verifactu.prevHashLabel')}</p>
                    <p className="text-xs text-text font-mono break-all">
                      f7e6d5c4b3a2...1a2b3c4d5e6f
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">{t('landing.verifactu.qrLabel')}</p>
                      <p className="text-xs text-text-secondary">{t('landing.verifactu.qrSub')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-text/5 flex items-center justify-center text-text-muted">
                      <IconQr />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.tech.title')}
            </h2>
            <p className="mt-4 text-text-secondary">
              {t('landing.tech.subtitle')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TECH_STACK.map((tech, i) => (
              <FadeIn key={tech.name} delay={i * 0.05}>
                <div className="text-center p-6 rounded-2xl border border-border bg-surface hover:shadow-md transition-all duration-300">
                  <p className="text-xs text-text-muted uppercase tracking-widest mb-2">{tech.label}</p>
                  <p className="text-sm md:text-base font-semibold text-text">{tech.name}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Open Source CTA ─── */}
      <section className="py-24 md:py-32 bg-text">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-surface tracking-tight">
              {t('landing.oss.title')}
            </h2>
            <p className="mt-4 text-lg text-surface/70">
              {t('landing.oss.sub')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/sergioramosv/invoiceapp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-surface text-text font-medium rounded-full hover:bg-surface/90 transition-colors"
              >
                <IconGitHub />
                {t('landing.oss.github')}
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 border border-surface/30 text-surface font-medium rounded-full hover:bg-surface/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Custom Development CTA ─── */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">{t('landing.hire.badge')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.hire.title')}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {t('landing.hire.sub')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:sergioramosvicente2004@gmail.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-text text-surface font-medium rounded-full hover:bg-text-secondary transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {t('landing.hire.cta')}
              </a>
              <a
                href="https://sergioramosvicente.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border text-text font-medium rounded-full hover:bg-surface-tertiary transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {t('landing.hire.web')}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
