'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { useI18n } from '@/lib/i18n'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, locale, setLocale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NAV_ITEMS = [
    {
      href: '/workspace',
      label: t('nav.invoices'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      href: '/workspace/templates',
      label: t('nav.templates'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
    {
      href: '/workspace/verifactu',
      label: t('nav.verifactu'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
  ]

  function isActive(href: string): boolean {
    if (href === '/workspace') return pathname === '/workspace'
    if (href === '/workspace/verifactu') return pathname.startsWith('/workspace/verifactu')
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 border-r border-border bg-surface overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <Link href="/workspace" className="flex items-center gap-2">
            <img src="/logo.svg" alt="InvoiceApp" className="w-6 h-6" />
            <span className="font-bold text-xl text-text">InvoiceApp</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-text/5 text-text'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle + Language + User section */}
        <div className="border-t border-border px-4 py-4 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
            {theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
          </button>

          {/* Language toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setLocale('es')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'es' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'en' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              EN
            </button>
          </div>

          {user && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-tertiary text-text rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
                <p className="text-sm text-text-secondary truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => signOut().then(() => router.push('/'))}
                className="w-full px-3 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-tertiary transition-colors text-center"
              >
                {t('nav.logout')}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden border-b border-border bg-surface px-4 py-3 flex items-center justify-between">
        <Link href="/workspace" className="flex items-center gap-2">
          <img src="/logo.svg" alt="InvoiceApp" className="w-6 h-6" />
          <span className="font-bold text-lg text-text">InvoiceApp</span>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => signOut().then(() => router.push('/'))}
              className="px-3 py-1.5 text-xs text-text-secondary border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              {t('nav.logoutShort')}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors text-text-secondary"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-surface-tertiary text-text'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
            {theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
          </button>
          {/* Mobile language toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden mx-3">
            <button
              onClick={() => setLocale('es')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'es' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                locale === 'en' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              EN
            </button>
          </div>
          {user && (
            <button
              onClick={() => {
                signOut().then(() => router.push('/'))
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {t('nav.logout')}
            </button>
          )}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
    </div>
  )
}
