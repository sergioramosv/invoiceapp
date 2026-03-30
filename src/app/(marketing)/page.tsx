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

/* ───────────────────────────── FAQ Accordion ───────────────────────────── */

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left gap-4"
      >
        <span className="text-base font-medium text-text">{question}</span>
        <IconChevron open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 pb-6' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-text-secondary leading-relaxed">{answer}</p>
      </div>
    </div>
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

  const features = [
    { icon: '✏️', title: t('landing.feat1.title'), desc: t('landing.feat1.desc') },
    { icon: '🌍', title: t('landing.feat2.title'), desc: t('landing.feat2.desc') },
    { icon: '📄', title: t('landing.feat3.title'), desc: t('landing.feat3.desc') },
    { icon: '📋', title: t('landing.feat4.title'), desc: t('landing.feat4.desc') },
    { icon: '📊', title: t('landing.feat5.title'), desc: t('landing.feat5.desc') },
    { icon: '🔒', title: t('landing.feat6.title'), desc: t('landing.feat6.desc') },
  ]

  const steps = [
    { num: '01', title: t('landing.step1.title'), desc: t('landing.step1.desc') },
    { num: '02', title: t('landing.step2.title'), desc: t('landing.step2.desc') },
    { num: '03', title: t('landing.step3.title'), desc: t('landing.step3.desc') },
  ]

  const proFeatures = [
    t('landing.proFeat1'),
    t('landing.proFeat2'),
    t('landing.proFeat3'),
    t('landing.proFeat4'),
    t('landing.proFeat5'),
    t('landing.proFeat6'),
  ]

  const testimonials = [
    { text: t('landing.test1.text'), name: t('landing.test1.name'), role: t('landing.test1.role') },
    { text: t('landing.test2.text'), name: t('landing.test2.name'), role: t('landing.test2.role') },
    { text: t('landing.test3.text'), name: t('landing.test3.name'), role: t('landing.test3.role') },
  ]

  const faqs = [
    { q: t('landing.faq1.q'), a: t('landing.faq1.a') },
    { q: t('landing.faq2.q'), a: t('landing.faq2.a') },
    { q: t('landing.faq3.q'), a: t('landing.faq3.a') },
    { q: t('landing.faq4.q'), a: t('landing.faq4.a') },
    { q: t('landing.faq5.q'), a: t('landing.faq5.a') },
    { q: t('landing.faq6.q'), a: t('landing.faq6.a') },
  ]

  const socialProofLabels = [
    t('landing.sp1'),
    t('landing.sp2'),
    t('landing.sp3'),
    t('landing.sp4'),
    t('landing.sp5'),
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
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-text text-surface rounded-full font-medium hover:bg-text-secondary transition-colors text-center"
              >
                {t('landing.cta')}
              </Link>
              <a
                href="#how"
                className="w-full sm:w-auto px-8 py-4 border border-border text-text rounded-full font-medium hover:bg-surface-tertiary transition-colors text-center"
              >
                {t('landing.ctaSecondary')}
              </a>
            </div>
          </FadeIn>

          {/* Invoice preview */}
          <div className="mt-16 md:mt-24">
            <InvoicePreviewDemo />
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-center text-sm text-text-muted mb-8">
              {t('landing.socialProof')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {socialProofLabels.map((name) => (
                <span key={name} className="text-lg font-semibold text-text-muted/40 tracking-wide uppercase">
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
              {t('landing.featuresTitle')}
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              {t('landing.featuresSubtitle')}
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="h-full p-8 rounded-2xl border border-border bg-surface hover:shadow-lg hover:shadow-text/5 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-3xl mb-4 block">{f.icon}</span>
                  <h3 className="text-lg font-semibold text-text mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how" className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.howTitle')}
            </h2>
          </FadeIn>

          <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border" />

            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.2} className="relative text-center">
                <div className="relative z-10 w-32 h-32 rounded-full bg-surface border border-border mx-auto flex items-center justify-center mb-8">
                  <span className="text-4xl font-black text-text">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary max-w-xs mx-auto">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="max-w-md mx-auto">
            <div className="rounded-2xl border border-border bg-surface p-10 shadow-xl text-center">
              <p className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-2">{t('landing.pricingTitle')}</p>
              <p className="text-lg font-medium text-text-secondary mb-6">{t('landing.pricingSubtitle')}</p>

              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl font-black text-text">29€</span>
                <span className="text-xl text-text-muted line-through">49€</span>
              </div>
              <p className="text-sm text-text-muted mb-8">{t('upgrade.oneTime')}</p>

              <ul className="space-y-4 text-left mb-10">
                {proFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-text">
                    <IconCheck />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full py-4 bg-text text-surface rounded-full font-medium hover:bg-text-secondary transition-colors text-center"
              >
                {t('landing.pricingCta')}
              </Link>
            </div>
            <p className="text-center mt-6 text-sm text-text-muted">
              {t('landing.pricingFooter')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.testimonialsTitle')}
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <FadeIn key={item.name} delay={i * 0.1}>
                <div className="h-full p-8 rounded-2xl border border-border bg-surface">
                  <p className="text-sm text-text leading-relaxed mb-8">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center text-text text-sm font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              {t('landing.faqTitle')}
            </h2>
          </FadeIn>

          <FadeIn>
            <div>
              {faqs.map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 md:py-32 bg-text">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-surface tracking-tight">
              {t('landing.finalCta')}
            </h2>
            <p className="mt-4 text-lg text-surface/70">
              {t('landing.finalCtaSub')}
            </p>
            <Link
              href="/signup"
              className="mt-10 inline-block px-8 py-4 bg-surface text-text font-medium rounded-full hover:bg-surface/90 transition-colors"
            >
              {t('landing.finalCtaBtn')}
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
