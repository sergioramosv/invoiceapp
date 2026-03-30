'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { getInvoices } from '@/lib/firestore'
import { buildVerifactuXML } from '@/lib/verifactu/xml-builder'
import { calculateTaxBreakdown } from '@/lib/verifactu'
import { SOFTWARE_INFO } from '@/lib/verifactu/constants'
import type { Invoice } from '@/types'
import { useI18n } from '@/lib/i18n'
import styles from './verifactu.module.css'

type VerifactuFilter = 'all' | 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected'

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$',
  }
  const sym = symbols[currency] || currency
  return `${sym}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function toVerifactuDate(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}

export default function VerifactuPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [filter, setFilter] = useState<VerifactuFilter>('all')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [xmlModal, setXmlModal] = useState<{ invoiceNumber: string; xml: string } | null>(null)

  const fetchInvoices = useCallback(async () => {
    if (!user) return
    try {
      const data = await getInvoices(user.uid)
      // Only show invoices (not quotes)
      setInvoices(data.filter(inv => inv.documentType !== 'quote'))
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoadingInvoices(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchInvoices()
  }, [user, fetchInvoices])

  async function handleSubmit(invoice: Invoice) {
    setSubmitting(invoice.id)
    try {
      const res = await fetch('/api/verifactu/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoice.id
              ? { ...inv, verifactuStatus: data.status, verifactuHash: data.hash, verifactuQRData: data.qrData }
              : inv
          )
        )
      }
    } catch (err) {
      console.error('Error submitting to AEAT:', err)
    } finally {
      setSubmitting(null)
    }
  }

  function handleViewXML(invoice: Invoice) {
    const taxBreakdown = calculateTaxBreakdown(invoice)
    const issueDate = toVerifactuDate(invoice.issueDate || '')
    const now = new Date()
    const description = invoice.items
      ?.map(item => item.description)
      .filter(Boolean)
      .join(', ')
      .slice(0, 500) || 'Servicios profesionales'

    const xml = buildVerifactuXML({
      softwareName: SOFTWARE_INFO.name,
      softwareNIF: SOFTWARE_INFO.nif,
      softwareId: SOFTWARE_INFO.softwareId,
      softwareVersion: SOFTWARE_INFO.version,
      issuerNIF: invoice.fromTaxId || '',
      issuerName: invoice.fromName || '',
      invoiceNumber: invoice.invoiceNumber || '',
      issueDate,
      invoiceType: invoice.invoiceType || 'F1',
      description,
      recipientNIF: invoice.billToTaxId || '',
      recipientName: invoice.billToName || '',
      taxBreakdown,
      totalAmount: invoice.total || 0,
      hash: invoice.verifactuHash || '(pending)',
      timestamp: toVerifactuDate(now.toISOString().split('T')[0]),
      time: now.toTimeString().split(' ')[0],
      timezone: now.getTimezoneOffset() <= -60 ? '02' : '01',
    })

    setXmlModal({ invoiceNumber: invoice.invoiceNumber || '', xml })
  }

  function getStatusBadge(status?: string) {
    switch (status) {
      case 'pending':
        return <span className={styles.badgePending}>{t('verifactu.pending')}</span>
      case 'sent':
        return <span className={styles.badgeSent}>{t('verifactu.sent')}</span>
      case 'accepted':
        return <span className={styles.badgeAccepted}>{t('verifactu.accepted')}</span>
      case 'rejected':
        return <span className={styles.badgeRejected}>{t('verifactu.rejected')}</span>
      default:
        return <span className={styles.badgeDraft}>{t('verifactu.draft')}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const filtered = invoices.filter(inv => {
    if (filter === 'all') return true
    if (filter === 'draft') return !inv.verifactuStatus || inv.verifactuStatus === 'draft'
    return inv.verifactuStatus === filter
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('verifactu.title')}</h1>
        <p className="text-text-secondary mt-1">{t('verifactu.subtitle')}</p>
      </div>

      <div className={styles.stagingBanner}>
        {t('verifactu.staging')}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border border-border rounded-lg overflow-hidden p-0.5 bg-surface-secondary w-fit">
        {(['all', 'draft', 'pending', 'sent', 'accepted', 'rejected'] as VerifactuFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f
                ? 'bg-text text-surface'
                : 'text-text-secondary hover:bg-surface-tertiary hover:text-text'
            }`}
          >
            {f === 'all' ? t('filter.all') : t(`verifactu.${f}`)}
          </button>
        ))}
      </div>

      {loadingInvoices ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-secondary">{t('verifactu.noInvoices')}</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">{t('table.number')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">{t('table.client')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary hidden sm:table-cell">{t('table.date')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">{t('table.total')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-secondary">{t('verifactu.status')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary hidden md:table-cell">{t('verifactu.hash')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(invoice => (
                  <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="py-3 px-4 font-medium">{invoice.invoiceNumber || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary">{invoice.billToName || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{invoice.issueDate || '---'}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(invoice.total || 0, invoice.currency || 'EUR')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(invoice.verifactuStatus)}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {invoice.verifactuHash ? (
                        <span className={styles.hashTruncated} title={invoice.verifactuHash}>
                          {invoice.verifactuHash}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">---</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(!invoice.verifactuStatus || invoice.verifactuStatus === 'draft') && (
                          <button
                            onClick={() => handleSubmit(invoice)}
                            disabled={submitting === invoice.id}
                            className="px-3 py-1.5 text-xs bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
                          >
                            {submitting === invoice.id ? t('verifactu.sending') : t('verifactu.send')}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewXML(invoice)}
                          className="px-3 py-1.5 text-xs border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors text-text-secondary"
                        >
                          {t('verifactu.viewXML')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* XML Modal */}
      {xmlModal && (
        <div className={styles.xmlModal}>
          <div className={styles.xmlModalBackdrop} onClick={() => setXmlModal(null)} />
          <div className={styles.xmlModalContent}>
            <div className={styles.xmlModalHeader}>
              <h3 className="font-semibold">XML - {xmlModal.invoiceNumber}</h3>
              <button
                onClick={() => setXmlModal(null)}
                className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors text-text-secondary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.xmlModalBody}>
              <pre className={styles.xmlPre}>{xmlModal.xml}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
