'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n'
import { getInvoices, getClients } from '@/lib/firestore'
import type { Invoice, Client } from '@/types'
import styles from './CommandPalette.module.css'

interface SearchResult {
  id: string
  category: 'invoices' | 'quotes' | 'clients' | 'pages'
  title: string
  subtitle: string
  href: string
}

export default function CommandPalette() {
  const { user } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setDebouncedQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // Fetch data on open
  useEffect(() => {
    if (!open || !user || dataLoaded) return
    async function load() {
      try {
        const [inv, cli] = await Promise.all([
          getInvoices(user!.uid),
          getClients(user!.uid),
        ])
        setInvoices(inv)
        setClients(cli)
        setDataLoaded(true)
      } catch (err) {
        console.error('Error loading search data:', err)
      }
    }
    load()
  }, [open, user, dataLoaded])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      setActiveIndex(0)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const pages: SearchResult[] = [
    { id: 'page-invoices', category: 'pages', title: t('search.invoices'), subtitle: '/workspace', href: '/workspace' },
    { id: 'page-templates', category: 'pages', title: 'Templates', subtitle: '/workspace/templates', href: '/workspace/templates' },
    { id: 'page-clients', category: 'pages', title: t('search.clients'), subtitle: '/workspace/clients', href: '/workspace/clients' },
    { id: 'page-settings', category: 'pages', title: 'Settings', subtitle: '/workspace/settings', href: '/workspace/settings' },
  ]

  const getResults = useCallback((): SearchResult[] => {
    const q = debouncedQuery.toLowerCase().trim()

    const invoiceResults: SearchResult[] = invoices
      .filter((inv) => {
        if (!q) return false
        return (
          (inv.invoiceNumber || '').toLowerCase().includes(q) ||
          (inv.billToName || '').toLowerCase().includes(q)
        )
      })
      .map((inv) => ({
        id: inv.id,
        category: inv.documentType === 'quote' ? 'quotes' as const : 'invoices' as const,
        title: inv.invoiceNumber || (inv.documentType === 'quote' ? t('search.quotes') : t('search.invoices')),
        subtitle: inv.billToName || inv.issueDate || '',
        href: `/workspace/edit/${inv.id}`,
      }))

    const clientResults: SearchResult[] = clients
      .filter((c) => {
        if (!q) return false
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.taxId || '').toLowerCase().includes(q)
        )
      })
      .map((c) => ({
        id: c.id,
        category: 'clients' as const,
        title: c.name,
        subtitle: c.email || c.taxId || '',
        href: `/workspace/clients/${c.id}`,
      }))

    const pageResults = pages.filter((p) => {
      if (!q) return true
      return p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    })

    return [...invoiceResults, ...clientResults, ...pageResults]
  }, [debouncedQuery, invoices, clients, t])

  const results = getResults()

  const grouped = {
    invoices: results.filter((r) => r.category === 'invoices'),
    quotes: results.filter((r) => r.category === 'quotes'),
    clients: results.filter((r) => r.category === 'clients'),
    pages: results.filter((r) => r.category === 'pages'),
  }

  const flatResults = [...grouped.invoices, ...grouped.quotes, ...grouped.clients, ...grouped.pages]

  function navigate(result: SearchResult) {
    setOpen(false)
    router.push(result.href)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatResults[activeIndex]) {
        navigate(flatResults[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const categoryLabels: Record<string, string> = {
    invoices: t('search.invoices'),
    quotes: t('search.quotes'),
    clients: t('search.clients'),
    pages: t('search.pages'),
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    invoices: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    quotes: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    clients: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    pages: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  }

  if (!open) return null

  let currentFlatIndex = 0

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className={styles.input}
          />
          <kbd className={styles.escKey}>ESC</kbd>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {flatResults.length === 0 && debouncedQuery ? (
            <div className={styles.noResults}>
              {t('search.noResults')}
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => {
              if (items.length === 0) return null
              return (
                <div key={category} className={styles.group}>
                  <div className={styles.groupLabel}>
                    {categoryLabels[category]}
                  </div>
                  {items.map((result) => {
                    const index = currentFlatIndex++
                    const isActive = index === activeIndex
                    return (
                      <button
                        key={result.id}
                        className={`${styles.resultItem} ${isActive ? styles.resultItemActive : ''}`}
                        onClick={() => navigate(result)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className={styles.resultIcon}>
                          {categoryIcons[result.category]}
                        </span>
                        <span className={styles.resultContent}>
                          <span className={styles.resultTitle}>{result.title}</span>
                          {result.subtitle && (
                            <span className={styles.resultSubtitle}>{result.subtitle}</span>
                          )}
                        </span>
                        <svg className={styles.resultArrow} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export function useCommandPalette() {
  return {
    open: () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    },
  }
}
