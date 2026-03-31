'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useDemo } from '@/lib/demo-context'
import { useI18n } from '@/lib/i18n'
import type { InvoiceStatus } from '@/types'

function formatCurrency(value: number, currency = 'EUR'): string {
  const symbols: Record<string, string> = { EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$' }
  return `${symbols[currency] || currency}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function DemoQuotesPage() {
  const { invoices, updateInvoice } = useDemo()
  const { t } = useI18n()
  const allDocs = invoices.filter(d => d.documentType === 'quote')
  const [fNumber, setFNumber] = useState('')
  const [fClient, setFClient] = useState('')

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: t('status.draft'), className: 'bg-text/10 text-text-secondary' },
    emitted: { label: t('status.emitted'), className: 'bg-primary/10 text-primary' },
    sent: { label: t('status.sent'), className: 'bg-accent/10 text-accent' },
    paid: { label: t('quotes.accepted') || 'Aceptado', className: 'bg-success/10 text-success' },
    overdue: { label: t('status.overdue'), className: 'bg-danger/10 text-danger' },
    cancelled: { label: t('status.cancelled'), className: 'bg-text/5 text-text-muted' },
  }

  const filtered = useMemo(() => {
    let list = [...allDocs]
    if (fNumber) list = list.filter(q => (q.invoiceNumber || '').toLowerCase().includes(fNumber.toLowerCase()))
    if (fClient) list = list.filter(q => (q.billToName || '').toLowerCase().includes(fClient.toLowerCase()))
    return list
  }, [allDocs, fNumber, fClient])

  const totalPresupuestado = allDocs.reduce((s, q) => s + (q.total || 0), 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.quotes')}</h1>
          <p className="text-text-secondary mt-1">{allDocs.length} {(t('filter.quotes') || 'presupuestos').toLowerCase()}</p>
        </div>
        <Link href="/demo/new" className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
          {t('quotes.new') || 'Nuevo presupuesto'}
        </Link>
      </div>

      {allDocs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('quotes.totalQuoted') || 'Total presupuestado'}</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalPresupuestado)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('quotes.issued') || 'Emitidos'}</p>
            <p className="text-2xl font-bold mt-1">{allDocs.filter(q => q.status !== 'paid').length}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-sm text-text-muted">{t('quotes.accepted') || 'Aceptados'}</p>
            <p className="text-2xl font-bold mt-1">{allDocs.filter(q => q.status === 'paid').length}</p>
          </div>
        </div>
      )}

      {allDocs.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <h3 className="text-lg font-medium">{t('quotes.empty') || 'No hay presupuestos'}</h3>
          <Link href="/demo/new" className="mt-6 inline-block px-8 py-3 bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
            {t('quotes.createFirst') || 'Crear presupuesto'}
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.number')}</th>
                <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.client')}</th>
                <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs hidden sm:table-cell">{t('table.date')}</th>
                <th className="text-right py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.total')}</th>
                <th className="text-center py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.status')}</th>
                <th className="text-right py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.actions')}</th>
              </tr>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-1.5"><input type="text" value={fNumber} onChange={e => setFNumber(e.target.value)} placeholder="..." className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none" /></th>
                <th className="px-4 py-1.5"><input type="text" value={fClient} onChange={e => setFClient(e.target.value)} placeholder="..." className="w-full px-2 py-1 text-xs border border-border rounded focus:outline-none" /></th>
                <th className="hidden sm:table-cell" /><th /><th /><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map(quote => {
                const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft
                return (
                  <tr key={quote.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="py-3 px-4 font-medium">{quote.invoiceNumber || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary">{quote.billToName || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{quote.issueDate || '---'}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(quote.total || 0, quote.currency || 'EUR')}</td>
                    <td className="py-3 px-4 text-center">
                      <select value={quote.status} onChange={e => updateInvoice(quote.id, { status: e.target.value as InvoiceStatus })} className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusCfg.className}`}>
                        {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/demo/edit/${quote.id}`} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-block">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
