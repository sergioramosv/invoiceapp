'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-text tracking-tight">
          InvoiceApp
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm text-text-secondary hover:text-text transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text transition-colors px-4 py-2"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors px-4 py-2 rounded-lg"
          >
            Crear cuenta gratis
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border px-6 pb-6 pt-2 space-y-4">
          <a
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-text-secondary hover:text-text transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-text-secondary hover:text-text transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-text-secondary hover:text-text transition-colors"
          >
            FAQ
          </a>
          <hr className="border-border" />
          <Link
            href="/login"
            className="block text-sm text-text-secondary hover:text-text transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="block text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors px-4 py-2.5 rounded-lg text-center"
          >
            Crear cuenta gratis
          </Link>
        </div>
      )}
    </nav>
  )
}

function Footer() {
  const linkGroups = [
    {
      title: 'Producto',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Templates', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidad', href: '#' },
        { label: 'Términos', href: '#' },
        { label: 'Cookies', href: '#' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contacto', href: '#' },
      ],
    },
  ]

  return (
    <footer className="bg-surface-secondary border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo + desc */}
          <div className="col-span-2">
            <Link href="/" className="text-xl font-bold text-text tracking-tight">
              InvoiceApp
            </Link>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-xs">
              El generador de facturas más rápido y elegante para freelancers y empresas.
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-text mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; 2026 InvoiceApp. Todos los derechos reservados.
          </p>
          <p className="text-xs text-text-muted">Hecho en España</p>
        </div>
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
