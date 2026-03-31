'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { getInvoices, getTemplates, deleteInvoice, duplicateInvoice, updateInvoice } from '@/lib/firestore'
import type { Template } from '@/types'
import { firestoreToInvoiceState } from '@/lib/invoice-converter'
import { generatePDF } from '@/lib/generate-pdf'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import { getSubtotal, getDiscountAmount, getTaxAmount, getTotal, getBalanceDue } from '@/types/invoice'
import type { Invoice, InvoiceStatus } from '@/types'
import styles from '../workspace.module.css'
import { ConfirmModal } from '@/components/ui/Modal'
import { useI18n } from '@/lib/i18n'
import { exportToCSV } from '@/lib/export-csv'
import InvoiceQuickPreview from '@/components/ui/InvoiceQuickPreview'
import { SkeletonTable } from '@/components/ui/Skeleton'

type FilterTab = 'all' | 'draft' | 'emitted'
type SortField = 'invoiceNumber' | 'billToName' | 'issueDate' | 'total' | 'status'
type SortDir = 'asc' | 'desc'

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = { EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$' }
  return `${symbols[currency] || currency}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1.5 -mb-0.5">
      <svg className={`w-3 h-3 -mb-[3px] ${active && dir === 'asc' ? 'text-text' : 'text-text-muted/30'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L9.33 5.25H0.67L5 0Z" />
      </svg>
      <svg className={`w-3 h-3 ${active && dir === 'desc' ? 'text-text' : 'text-text-muted/30'}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0.67 0.75H9.33L5 6Z" />
      </svg>
    </span>
  )
}

export default function InvoicesPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [allDocs, setAllDocs] = useState<Invoice[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [hoverPreview, setHoverPreview] = useState<{ invoice: Invoice; x: number; y: number } | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [showNewMenu, setShowNewMenu] = useState(false)

  // Sorting
  const [sortField, setSortField] = useState<SortField>('issueDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Per-column filters
  const [fNumber, setFNumber] = useState('')
  const [fClient, setFClient] = useState('')
  const [fStatus, setFStatus] = useState('')

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: t('status.draft'), className: 'bg-text/10 text-text-secondary' },
    emitted: { label: t('status.emitted'), className: 'bg-primary/10 text-primary' },
    sent: { label: t('status.sent'), className: 'bg-accent/10 text-accent' },
    paid: { label: t('status.paid'), className: 'bg-success/10 text-success' },
    overdue: { label: t('status.overdue'), className: 'bg-danger/10 text-danger' },
    cancelled: { label: t('status.cancelled'), className: 'bg-text/5 text-text-muted' },
  }

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      const data = await getInvoices(user.uid)
      setAllDocs(data.filter(d => d.documentType !== 'quote'))
    } catch (err) { console.error('Error fetching invoices:', err) }
    finally { setLoadingData(false) }
  }, [user])

  useEffect(() => { if (!loading && !user) router.push('/login') }, [user, loading, router])
  useEffect(() => {
    if (user) {
      fetchData()
      getTemplates(user.uid).then(setTemplates).catch(() => {})
    }
  }, [user, fetchData])

  useEffect(() => {
    if (!pdfInvoice) return
    const timer = setTimeout(async () => {
      if (!pdfRef.current) { setPdfInvoice(null); return }
      try {
        const filename = pdfInvoice.invoiceNumber ? `factura-${pdfInvoice.invoiceNumber}.pdf` : 'factura.pdf'
        await generatePDF(pdfRef.current, filename)
      } catch (err) { console.error(err) }
      finally { setPdfInvoice(null) }
    }, 1200)
    return () => clearTimeout(timer)
  }, [pdfInvoice])

  async function confirmDelete() {
    if (!deleteTarget) return
    try { await deleteInvoice(deleteTarget); setAllDocs(prev => prev.filter(i => i.id !== deleteTarget)) } catch (err) { console.error(err) }
    setDeleteTarget(null)
  }

  async function handleDuplicate(invoice: Invoice) {
    try { await duplicateInvoice(invoice); await fetchData() } catch (err) { console.error(err) }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  // Filter + Sort
  const filtered = useMemo(() => {
    let list = [...allDocs]

    // Tab filter
    if (filterTab === 'draft') list = list.filter(i => !i.emittedAt)
    if (filterTab === 'emitted') list = list.filter(i => i.emittedAt)

    // Column filters
    if (fNumber) list = list.filter(i => (i.invoiceNumber || '').toLowerCase().includes(fNumber.toLowerCase()))
    if (fClient) list = list.filter(i => (i.billToName || '').toLowerCase().includes(fClient.toLowerCase()))
    if (fStatus) list = list.filter(i => i.status === fStatus)

    // Sort
    list.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'invoiceNumber': cmp = (a.invoiceNumber || '').localeCompare(b.invoiceNumber || ''); break
        case 'billToName': cmp = (a.billToName || '').localeCompare(b.billToName || ''); break
        case 'issueDate': cmp = (a.issueDate || '').localeCompare(b.issueDate || ''); break
        case 'total': cmp = (a.total || 0) - (b.total || 0); break
        case 'status': cmp = (a.status || '').localeCompare(b.status || ''); break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [allDocs, filterTab, fNumber, fClient, fStatus, sortField, sortDir])

  if (loading || !user) return null

  const invoices = allDocs
  const totalFacturado = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
  const emittedCount = invoices.filter(i => i.emittedAt).length
  const draftCount = invoices.filter(i => !i.emittedAt).length
  const pdfPreviewState = pdfInvoice ? firestoreToInvoiceState(pdfInvoice) : null

  const thClass = "py-2.5 px-4 font-semibold text-text-secondary text-xs cursor-pointer hover:text-text transition-colors select-none whitespace-nowrap"

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.invoices')}</h1>
          <p className="text-text-secondary mt-1">{invoices.length} {t('filter.invoices').toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(filtered, 'facturas')} className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            CSV
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors flex items-center gap-2"
            >
              {t('invoices.new')}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showNewMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNewMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-lg z-20 py-2">
                  <Link href="/workspace/new" onClick={() => setShowNewMenu(false)} className="block px-4 py-2.5 text-sm hover:bg-surface-tertiary transition-colors">
                    <span className="font-medium">{t('workspace.fromScratch')}</span>
                    <span className="block text-text-muted text-xs mt-0.5">{t('workspace.fromScratchDesc')}</span>
                  </Link>
                  {templates.length > 0 && (
                    <>
                      <div className="border-t border-border my-1" />
                      <p className="px-4 py-1.5 text-xs text-text-muted font-medium">{t('nav.templates')}</p>
                      {templates.map(tmpl => (
                        <Link key={tmpl.id} href={`/workspace/new?template=${tmpl.id}`} onClick={() => setShowNewMenu(false)}
                          className="block px-4 py-2 text-sm hover:bg-surface-tertiary transition-colors">{tmpl.name}</Link>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('workspace.totalInvoiced')}</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalFacturado, 'EUR')}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('invoices.created')}</p>
            <p className="text-2xl font-bold mt-1">{draftCount}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('invoices.emitted')}</p>
            <p className="text-2xl font-bold mt-1">{emittedCount}</p>
          </div>
        </div>
      )}

      {/* Tab filters */}
      {invoices.length > 0 && (
        <div className={styles.filterTabs}>
          <button onClick={() => setFilterTab('all')} className={`${styles.filterTab} ${filterTab === 'all' ? styles.filterTabActive : ''}`}>
            {t('filter.all')} ({invoices.length})
          </button>
          <button onClick={() => setFilterTab('draft')} className={`${styles.filterTab} ${filterTab === 'draft' ? styles.filterTabActive : ''}`}>
            {t('invoices.created')} ({draftCount})
          </button>
          <button onClick={() => setFilterTab('emitted')} className={`${styles.filterTab} ${filterTab === 'emitted' ? styles.filterTabActive : ''}`}>
            {t('invoices.emittedVF')} ({emittedCount})
          </button>
        </div>
      )}

      {loadingData ? <SkeletonTable rows={5} /> : filtered.length === 0 && invoices.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium">{t('invoices.empty')}</h3>
          <Link href="/workspace/new" className="mt-6 inline-block px-8 py-3 bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
            {t('invoices.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {/* Sortable headers */}
                <tr className="border-b border-border bg-surface-secondary">
                  <th className={`text-left ${thClass}`} onClick={() => toggleSort('invoiceNumber')}>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                      {t('table.number')}<SortIcon active={sortField === 'invoiceNumber'} dir={sortDir} />
                    </span>
                  </th>
                  <th className={`text-left ${thClass}`} onClick={() => toggleSort('billToName')}>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                      {t('table.client')}<SortIcon active={sortField === 'billToName'} dir={sortDir} />
                    </span>
                  </th>
                  <th className={`text-left ${thClass} hidden sm:table-cell`} onClick={() => toggleSort('issueDate')}>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                      {t('table.date')}<SortIcon active={sortField === 'issueDate'} dir={sortDir} />
                    </span>
                  </th>
                  <th className={`text-right ${thClass}`} onClick={() => toggleSort('total')}>
                    <span className="inline-flex items-center gap-1 justify-end">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {t('table.total')}<SortIcon active={sortField === 'total'} dir={sortDir} />
                    </span>
                  </th>
                  <th className={`text-center ${thClass}`} onClick={() => toggleSort('status')}>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                      {t('table.status')}<SortIcon active={sortField === 'status'} dir={sortDir} />
                    </span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-text-secondary text-xs hidden sm:table-cell">VF</th>
                  <th className="text-right py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.actions')}</th>
                </tr>
                {/* Per-column filters */}
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-1.5">
                    <input type="text" value={fNumber} onChange={e => setFNumber(e.target.value)} placeholder="..."
                      className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </th>
                  <th className="px-4 py-1.5">
                    <input type="text" value={fClient} onChange={e => setFClient(e.target.value)} placeholder="..."
                      className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </th>
                  <th className="px-4 py-1.5 hidden sm:table-cell" />
                  <th className="px-4 py-1.5" />
                  <th className="px-4 py-1.5">
                    <select value={fStatus} onChange={e => setFStatus(e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-border rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary/30">
                      <option value="">{t('filter.all')}</option>
                      {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                    </select>
                  </th>
                  <th className="hidden sm:table-cell" />
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-text-muted">{t('workspace.noResults')}</td></tr>
                ) : filtered.map(invoice => {
                  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
                  return (
                    <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                      <td className="py-3 px-4 font-medium"
                        onMouseEnter={e => setHoverPreview({ invoice, x: e.clientX, y: e.clientY })}
                        onMouseMove={e => setHoverPreview(prev => prev?.invoice.id === invoice.id ? { ...prev, x: e.clientX, y: e.clientY } : prev)}
                        onMouseLeave={() => setHoverPreview(null)}>
                        {invoice.invoiceNumber || '---'}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{invoice.billToName || '---'}</td>
                      <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{invoice.issueDate || '---'}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(invoice.total || 0, invoice.currency || 'EUR')}</td>
                      <td className="py-3 px-4 text-center">
                        <select value={invoice.status} onChange={async e => {
                          const s = e.target.value as InvoiceStatus
                          await updateInvoice(invoice.id, { status: s })
                          setAllDocs(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: s } : inv))
                        }} className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusCfg.className}`}>
                          {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          invoice.verifactuStatus === 'accepted' ? 'bg-success' :
                          invoice.verifactuStatus === 'pending' || invoice.verifactuStatus === 'sent' ? 'bg-warning' :
                          invoice.verifactuStatus === 'rejected' ? 'bg-danger' : 'bg-text-muted/30'
                        }`} title={invoice.verifactuStatus || 'none'} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPdfInvoice(invoice)} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={t('action.downloadPDF')}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </button>
                          <Link href={`/workspace/edit/${invoice.id}`} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={t('action.edit')}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => handleDuplicate(invoice)} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={t('action.duplicate')}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          </button>
                          <button onClick={() => setDeleteTarget(invoice.id)} className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title={t('action.delete')}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {pdfPreviewState && (
        <div className={`${styles.pdfRendererOffscreen} light-paper`} ref={pdfRef}>
          <InvoicePreview state={pdfPreviewState} subtotal={getSubtotal(pdfPreviewState)} discountAmount={getDiscountAmount(pdfPreviewState)} taxAmount={getTaxAmount(pdfPreviewState)} total={getTotal(pdfPreviewState)} balanceDue={getBalanceDue(pdfPreviewState)} />
        </div>
      )}

      {hoverPreview && <InvoiceQuickPreview invoice={hoverPreview.invoice} mouseX={hoverPreview.x} mouseY={hoverPreview.y} />}
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title={t('modal.deleteDocument')} message={t('modal.deleteDocumentMsg')} confirmLabel={t('modal.deleteBtn')} danger />
    </div>
  )
}
