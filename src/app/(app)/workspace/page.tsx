'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { getInvoices, deleteInvoice, duplicateInvoice, convertQuoteToInvoice } from '@/lib/firestore'
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

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Pagada', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Vencida', className: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelada', className: 'bg-gray-200 text-gray-600' },
}

type FilterTab = 'all' | 'invoice' | 'quote'

function formatCurrency(value: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$',
  }
  const sym = symbols[currency] || currency
  return `${sym}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getDocLabel(docType?: DocumentType): string {
  return docType === 'quote' ? 'Presupuesto' : 'Factura'
}

export default function WorkspacePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<FilterTab>('all')
  const [pdfInvoice, setPdfInvoice] = useState<Invoice | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

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
    if (user) fetchInvoices()
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
    }, 300)
    return () => clearTimeout(timer)
  }, [pdfInvoice])

  async function handleDelete(id: string) {
    if (!window.confirm('Estas seguro de que quieres eliminar esta factura?')) return
    try {
      await deleteInvoice(id)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      console.error('Error deleting invoice:', err)
    }
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

  async function handleConvertToInvoice(quote: Invoice) {
    if (!window.confirm('Crear una factura a partir de este presupuesto?')) return
    try {
      await convertQuoteToInvoice(quote)
      await fetchInvoices()
    } catch (err) {
      console.error('Error converting quote to invoice:', err)
    }
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
  const facturasPendientes = invoices.filter(
    (inv) => inv.documentType !== 'quote' && (inv.status === 'draft' || inv.status === 'sent')
  ).length
  const facturasPagadas = invoices.filter(
    (inv) => inv.documentType !== 'quote' && inv.status === 'paid'
  ).length
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Documentos</h1>
          <p className="text-text-secondary mt-1">
            {invoices.length} documento{invoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/workspace/new"
          className="px-6 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          + Nuevo documento
        </Link>
      </div>

      {/* Dashboard stats */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-muted truncate">Total facturado</p>
                <p className="text-2xl font-bold truncate">{formatCurrency(totalFacturado, 'EUR')}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-muted truncate">Pendientes</p>
                <p className="text-2xl font-bold">{facturasPendientes}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-muted truncate">Pagadas</p>
                <p className="text-2xl font-bold">{facturasPagadas}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-muted truncate">Presupuestos</p>
                <p className="text-2xl font-bold">{totalPresupuestos}</p>
              </div>
            </div>
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
              Todas
            </button>
            <button
              onClick={() => setFilterTab('invoice')}
              className={`${styles.filterTab} ${filterTab === 'invoice' ? styles.filterTabActive : ''}`}
            >
              Facturas
            </button>
            <button
              onClick={() => setFilterTab('quote')}
              className={`${styles.filterTab} ${filterTab === 'quote' ? styles.filterTabActive : ''}`}
            >
              Presupuestos
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente o numero..."
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
          <h3 className="text-lg font-medium">No tienes documentos todavia</h3>
          <p className="text-text-secondary mt-1">Crea tu primera factura o presupuesto en segundos</p>
          <Link
            href="/workspace/new"
            className="mt-6 inline-block px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Crear primer documento
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-secondary">No se encontraron documentos con ese criterio</p>
        </div>
      ) : (
        /* Invoice table */
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Numero</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-secondary hidden sm:table-cell">Fecha</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-secondary">Estado</th>
                  <th className="text-right py-3 px-4 font-semibold text-text-secondary">Acciones</th>
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
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          {/* Convert quote to invoice */}
                          {isQuote && (
                            <button
                              onClick={() => handleConvertToInvoice(invoice)}
                              className="p-1.5 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Convertir en factura"
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
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(invoice)}
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Duplicar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title="Eliminar"
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
        <div className={styles.pdfRendererOffscreen} ref={pdfRef}>
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
    </div>
  )
}
