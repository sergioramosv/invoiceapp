'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/ui/FadeIn'

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

function InvoicePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="mx-auto max-w-lg"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-border p-8 md:p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-text rounded-full flex items-center justify-center text-white font-bold text-sm">
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
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-full">
              Pagada
            </span>
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
            <span className="text-text">10.164,00€</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────────────────────────── Main Page ───────────────────────────── */

export default function LandingPage() {
  const features = [
    { icon: '✏️', title: 'Editor en tiempo real', desc: 'Visualiza tu factura mientras la editas. WYSIWYG perfecto.' },
    { icon: '🌍', title: 'Multi-moneda e idioma', desc: 'Factura en EUR, USD, GBP y mas. En espanol, ingles o aleman.' },
    { icon: '📄', title: 'PDF instantaneo', desc: 'Descarga profesional en un clic. Listo para enviar.' },
    { icon: '📋', title: 'Templates reutilizables', desc: 'Guarda tus disenos y factura 10x mas rapido.' },
    { icon: '📊', title: 'Presupuestos', desc: 'Crea presupuestos y conviertelos en factura al aprobar.' },
    { icon: '🔒', title: 'Datos seguros', desc: 'Cifrado end-to-end. Cumplimiento total con GDPR.' },
  ]

  const steps = [
    { num: '01', title: 'Crea tu factura', desc: 'Rellena los datos de tu empresa y cliente en el editor visual.' },
    { num: '02', title: 'Personaliza', desc: 'Anade tu logo, elige moneda, idioma y template.' },
    { num: '03', title: 'Envia y cobra', desc: 'Descarga en PDF o comparte el enlace directo.' },
  ]

  const proFeatures = [
    'Sin watermark',
    'Templates ilimitados',
    'Export PDF + PNG',
    'Soporte prioritario',
    'Actualizaciones de por vida',
    'Multi-moneda e idioma',
  ]

  const testimonials = [
    { text: 'InvoiceApp me ahorra horas cada semana. El editor es rapidisimo y las facturas quedan impecables.', name: 'Laura M.', role: 'Disenadora freelance' },
    { text: 'Por fin una herramienta de facturacion que no parece de los 90. Elegante y funcional.', name: 'Carlos R.', role: 'CEO de StartupXYZ' },
    { text: 'El pago unico fue lo que me convencio. Sin suscripciones, sin sorpresas. Totalmente recomendable.', name: 'Ana S.', role: 'Consultora independiente' },
  ]

  const faqs = [
    { q: 'Es realmente gratis para empezar?', a: 'Si, puedes crear facturas gratis con watermark. Para eliminarlo, adquiere la licencia Pro.' },
    { q: 'Que incluye el plan Pro?', a: 'Acceso de por vida, sin watermark, templates ilimitados, export multi-formato y soporte prioritario.' },
    { q: 'Mis datos estan seguros?', a: 'Absolutamente. Usamos Firebase con cifrado y cumplimos con GDPR.' },
    { q: 'Puedo cambiar la moneda de mis facturas?', a: 'Si, soportamos mas de 20 monedas internacionales.' },
    { q: 'Necesito instalar algo?', a: 'No, InvoiceApp funciona 100% en el navegador. Tambien puedes instalarla como PWA.' },
  ]

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-text tracking-tight leading-[1.1]">
              Facturacion profesional,{' '}
              <br className="hidden sm:block" />
              simplificada.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto">
              Crea facturas y presupuestos profesionales en segundos. Sin complicaciones.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-medium hover:bg-primary-light transition-colors text-center"
              >
                Empezar gratis
              </Link>
              <a
                href="#how"
                className="w-full sm:w-auto px-8 py-4 border border-border text-text rounded-full font-medium hover:bg-surface-tertiary transition-colors text-center"
              >
                Ver como funciona
              </a>
            </div>
          </FadeIn>

          {/* Invoice preview */}
          <div className="mt-16 md:mt-24">
            <InvoicePreview />
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-16 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-center text-sm text-text-muted mb-8">
              Mas de 2,000 profesionales ya facturan con InvoiceApp
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['Freelancers', 'Agencias', 'Startups', 'Consultoras', 'Despachos'].map((name) => (
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
              Todo lo que necesitas
            </h2>
            <p className="mt-4 text-text-secondary max-w-xl mx-auto">
              Herramientas potentes con una interfaz minimalista.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className="h-full p-8 rounded-2xl border border-border bg-white hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
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
              Como funciona
            </h2>
          </FadeIn>

          <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border" />

            {steps.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.2} className="relative text-center">
                <div className="relative z-10 w-32 h-32 rounded-full bg-white border border-border mx-auto flex items-center justify-center mb-8">
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
            <div className="rounded-2xl border border-border bg-white p-10 shadow-xl text-center">
              <p className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-2">Pro</p>
              <p className="text-lg font-medium text-text-secondary mb-6">Acceso de por vida</p>

              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-6xl font-black text-text">29€</span>
                <span className="text-xl text-text-muted line-through">49€</span>
              </div>
              <p className="text-sm text-text-muted mb-8">pago unico</p>

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
                className="block w-full py-4 bg-primary text-white rounded-full font-medium hover:bg-primary-light transition-colors text-center"
              >
                Empezar ahora
              </Link>
            </div>
            <p className="text-center mt-6 text-sm text-text-muted">
              Empieza gratis, sin tarjeta
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 md:py-32 bg-surface-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Lo que dicen nuestros usuarios
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="h-full p-8 rounded-2xl border border-border bg-white">
                  <p className="text-sm text-text leading-relaxed mb-8">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-tertiary flex items-center justify-center text-text text-sm font-bold">
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
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Preguntas frecuentes
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
      <section className="py-24 md:py-32 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Listo para facturar como un profesional?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Unete a miles de freelancers y empresas que ya usan InvoiceApp
            </p>
            <Link
              href="/signup"
              className="mt-10 inline-block px-8 py-4 bg-white text-primary font-medium rounded-full hover:bg-white/90 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
