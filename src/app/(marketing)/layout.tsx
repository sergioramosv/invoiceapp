'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, locale, setLocale } = useI18n()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="InvoiceApp" className="w-6 h-6" />
          <span className="font-bold text-lg text-text">InvoiceApp</span>
        </Link>

        {/* Desktop auth + language */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setLocale('es')}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                locale === 'es' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-xs font-medium transition-colors ${
                locale === 'en' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              EN
            </button>
          </div>
          <Link
            href="/demo"
            className="text-sm font-medium text-surface bg-text hover:bg-text-secondary transition-colors px-5 py-2 rounded-full flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('landing.demo')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-text"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="8" x2="21" y2="8" />
                <line x1="3" y1="16" x2="21" y2="16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl border-b border-border px-6 pb-6 pt-2 space-y-4">
          {/* Mobile language toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden w-fit">
            <button
              onClick={() => setLocale('es')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'es' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'en' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              EN
            </button>
          </div>
          <Link
            href="/demo"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 text-sm font-medium text-surface bg-text hover:bg-text-secondary transition-colors px-4 py-2.5 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('landing.demo')}
          </Link>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border">
      <div className="px-6 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            {t('footer.copyright')}
          </p>
      </div>
    </footer>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
