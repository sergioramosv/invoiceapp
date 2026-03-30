'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { getInvoices, getTemplates, deleteInvoice, duplicateInvoice, convertQuoteToInvoice, updateInvoice } from '@/lib/firestore'
import type { Template } from '@/types'
import { firestoreToInvoiceState } from '@/lib/invoice-converter'
import { generatePDF } from '@/lib/generate-pdf'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import {
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
} from '@/types/invoice'
import type { Invoice, InvoiceStatus, DocumentType } from '@/types'
import styles from './workspace.module.css'
import verifactuStyles from './verifactu/verifactu.module.css'
import { ConfirmModal } from '@/components/ui/Modal'
import { useI18n } from '@/lib/i18n'

type FilterTab = 'all' | 'invoice' | 'quote'

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$',
  }
  const sym = symbols[currency] || currency
  return `${sym}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function WorkspacePage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [convertTarget, setConvertTarget] = useState<Invoice | null>(null)

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: t('status.draft'), className: 'bg-text/10 text-text-secondary' },
    sent: { label: t('status.sent'), className: 'bg-accent/10 text-accent' },
    paid: { label: t('status.paid'), className: 'bg-success/10 text-success' },
    overdue: { label: t('status.overdue'), className: 'bg-danger/10 text-danger' },
    cancelled: { label: t('status.cancelled'), className: 'bg-text/5 text-text-muted' },
  }

  function getDocLabel(docType?: DocumentType): string {
    return docType === 'quote' ? t('docType.quote') : t('docType.invoice')
  }

  const fetchInvoices = useCallback(async () => {
    if (!user) return
    try {
      const data = await getInvoices(user.uid)
      setInvoices(data)
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
    if (user) {
      fetchInvoices()
      getTemplates(user.uid).then(setTemplates).catch(() => {})
    }
  }, [user, fetchInvoices])

  // When pdfInvoice is set, wait for render then generate PDF
  useEffect(() => {
    if (!pdfInvoice || !pdfRef.current) return
    const timer = setTimeout(async () => {
      if (!pdfRef.current) return
      try {
        const isQuote = pdfInvoice.documentType === 'quote'
        const prefix = isQuote ? 'presupuesto' : 'factura'
        const filename = pdfInvoice.invoiceNumber
          ? `${prefix}-${pdfInvoice.invoiceNumber}.pdf`
          : `${prefix}.pdf`
        await generatePDF(pdfRef.current, filename, false)
      } catch (err) {
        console.error('Error generating PDF:', err)
      } finally {
        setPdfInvoice(null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [pdfInvoice])

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteInvoice(deleteTarget)
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget))
    } catch (err) {
      console.error('Error deleting invoice:', err)
    }
    setDeleteTarget(null)
  }

  async function handleDuplicate(invoice: Invoice) {
    try {
      await duplicateInvoice(invoice)
      await fetchInvoices()
    } catch (err) {
      console.error('Error duplicating invoice:', err)
    }
  }

  function handleDownloadPDF(invoice: Invoice) {
    setPdfInvoice(invoice)
  }

  async function confirmConvert() {
    if (!convertTarget) return
    try {
      await convertQuoteToInvoice(convertTarget)
      await fetchInvoices()
    } catch (err) {
      console.error('Error converting quote to invoice:', err)
    }
    setConvertTarget(null)
  }

  if (loading || (!user && loading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  // Dashboard stats
  const totalFacturado = invoices
    .filter((inv) => inv.status === 'paid' && inv.documentType !== 'quote')
    .reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPresupuestos = invoices.filter(
    (inv) => inv.documentType === 'quote'
  ).length

  const filtered = invoices.filter((inv) => {
    // Filter by document type
    if (filterTab === 'invoice' && inv.documentType === 'quote') return false
    if (filterTab === 'quote' && inv.documentType !== 'quote') return false

    // Filter by search
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.billToName || '').toLowerCase().includes(q)
    )
  })

  // Render the off-screen preview for PDF generation
  const pdfPreviewState = pdfInvoice ? firestoreToInvoiceState(pdfInvoice) : null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('workspace.title')}</h1>
          <p className="text-text-secondary mt-1">
            {invoices.length} {invoices.length !== 1 ? t('workspace.documents') : t('workspace.document')}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors flex items-center gap-2"
          >
            {t('workspace.newDocument')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showNewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg z-20 py-2">
                <Link
                  href="/workspace/new"
                  onClick={() => setShowNewMenu(false)}
                  className="block px-4 py-2.5 text-sm hover:bg-surface-tertiary transition-colors"
                >
                  <span className="font-medium">{t('workspace.fromScratch')}</span>
                  <span className="block text-text-muted text-xs mt-0.5">{t('workspace.fromScratchDesc')}</span>
                </Link>
                {templates.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <p className="px-4 py-1.5 text-xs text-text-muted font-medium">{t('workspace.fromTemplate')}</p>
                    {templates.map((tmpl) => (
                      <Link
                        key={tmpl.id}
                        href={`/workspace/new?template=${tmpl.id}`}
                        onClick={() => setShowNewMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-surface-tertiary transition-colors"
                      >
                        {tmpl.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dashboard stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('workspace.totalInvoiced')}</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalFacturado, 'EUR')}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('workspace.invoiceCount')}</p>
            <p className="text-2xl font-bold mt-1">{invoices.filter(i => i.documentType !== 'quote').length}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('workspace.quoteCount')}</p>
            <p className="text-2xl font-bold mt-1">{totalPresupuestos}</p>
          </div>
        </div>
      )}

      {/* Filter tabs + Search */}
      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className={styles.filterTabs}>
            <button
              onClick={() => setFilterTab('all')}
              className={`${styles.filterTab} ${filterTab === 'all' ? styles.filterTabActive : ''}`}
            >
              {t('filter.all')}
            </button>
            <button
              onClick={() => setFilterTab('invoice')}
              className={`${styles.filterTab} ${filterTab === 'invoice' ? styles.filterTabActive : ''}`}
            >
              {t('filter.invoices')}
            </button>
            <button
              onClick={() => setFilterTab('quote')}
              className={`${styles.filterTab} ${filterTab === 'quote' ? styles.filterTabActive : ''}`}
            >
              {t('filter.quotes')}
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('workspace.search')}
            className="w-full max-w-md px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      )}

      {loadingInvoices ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-tertiary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">{t('workspace.noDocuments')}</h3>
          <p className="text-text-secondary mt-1">{t('workspace.noDocumentsDesc')}</p>
          <Link
            href="/workspace/new"
            className="mt-6 inline-block px-8 py-3 bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            {t('workspace.createFirst')}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-secondary">{t('workspace.noResults')}</p>
        </div>
      ) : (
        /* Invoice table */
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">{t('table.type')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">{t('table.number')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">{t('table.client')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary hidden sm:table-cell">{t('table.date')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">{t('table.total')}</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-secondary">{t('table.status')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => {
                  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
                  const isQuote = invoice.documentType === 'quote'
                  return (
                    <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                      <td className="py-3 px-4">
                        <span className={isQuote ? styles.badgeQuote : styles.badgeInvoice}>
                          {getDocLabel(invoice.documentType)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {invoice.invoiceNumber || '---'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">
                        {invoice.billToName || '---'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">
                        {invoice.issueDate || '---'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(invoice.total || 0, invoice.currency || 'EUR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <select
                            value={invoice.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as InvoiceStatus
                              await updateInvoice(invoice.id, { status: newStatus })
                              setInvoices((prev) =>
                                prev.map((inv) =>
                                  inv.id === invoice.id ? { ...inv, status: newStatus } : inv
                                )
                              )
                            }}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusCfg.className}`}
                          >
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}</option>
                            ))}
                          </select>
                          {invoice.verifactuStatus && invoice.verifactuStatus !== 'draft' && (
                            <span
                              title={`VeriFactu: ${invoice.verifactuStatus}`}
                              className="shrink-0"
                            >
                              {invoice.verifactuStatus === 'accepted' ? (
                                <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : invoice.verifactuStatus === 'rejected' ? (
                                <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : (
                                <span className={`${verifactuStyles.verifactuDot} ${
                                  invoice.verifactuStatus === 'pending' ? verifactuStyles.dotPending : verifactuStyles.dotSent
                                }`} />
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={t('action.downloadPDF')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          {/* Convert quote to invoice */}
                          {isQuote && (
                            <button
                              onClick={() => setConvertTarget(invoice)}
                              className="p-1.5 text-text-secondary hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                              title={t('action.convertToInvoice')}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </button>
                          )}
                          {/* Edit */}
                          <Link
                            href={`/workspace/edit/${invoice.id}`}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={t('action.edit')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(invoice)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title={t('action.duplicate')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(invoice.id)}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title={t('action.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Off-screen PDF render target */}
      {pdfPreviewState && (
        <div className={`${styles.pdfRendererOffscreen} light-paper`} ref={pdfRef}>
          <InvoicePreview
            state={pdfPreviewState}
            subtotal={getSubtotal(pdfPreviewState)}
            discountAmount={getDiscountAmount(pdfPreviewState)}
            taxAmount={getTaxAmount(pdfPreviewState)}
            total={getTotal(pdfPreviewState)}
            balanceDue={getBalanceDue(pdfPreviewState)}
          />
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('modal.deleteDocument')}
        message={t('modal.deleteDocumentMsg')}
        confirmLabel={t('modal.deleteBtn')}
        danger
      />

      <ConfirmModal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConfirm={confirmConvert}
        title={t('modal.convertInvoice')}
        message={t('modal.convertInvoiceMsg')}
        confirmLabel={t('modal.convertBtn')}
      />
    </div>
  )
}
