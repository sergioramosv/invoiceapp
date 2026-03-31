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

type SortField = 'invoiceNumber' | 'billToName' | 'issueDate' | 'total' | 'status'
type SortDir = 'asc' | 'desc'

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

export default function DemoInvoicesPage() {
  const { invoices, updateInvoice } = useDemo()
  const { t } = useI18n()

  const allDocs = invoices.filter(d => d.documentType !== 'quote')

  const [sortField, setSortField] = useState<SortField>('issueDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [fNumber, setFNumber] = useState('')
  const [fClient, setFClient] = useState('')
  const [fStatus, setFStatus] = useState('')

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: t('status.draft') || 'Borrador', className: 'bg-text/10 text-text-secondary' },
    emitted: { label: t('status.emitted') || 'Emitida', className: 'bg-primary/10 text-primary' },
    sent: { label: t('status.sent') || 'Enviada', className: 'bg-accent/10 text-accent' },
    paid: { label: t('status.paid') || 'Pagada', className: 'bg-success/10 text-success' },
    overdue: { label: t('status.overdue') || 'Vencida', className: 'bg-danger/10 text-danger' },
    cancelled: { label: t('status.cancelled') || 'Cancelada', className: 'bg-text/5 text-text-muted' },
  }

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = [...allDocs]
    if (fNumber) list = list.filter(i => (i.invoiceNumber || '').toLowerCase().includes(fNumber.toLowerCase()))
    if (fClient) list = list.filter(i => (i.billToName || '').toLowerCase().includes(fClient.toLowerCase()))
    if (fStatus) list = list.filter(i => i.status === fStatus)
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
  }, [allDocs, fNumber, fClient, fStatus, sortField, sortDir])

  const totalFacturado = allDocs.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)

  const thClass = "py-2.5 px-4 font-semibold text-text-secondary text-xs cursor-pointer hover:text-text transition-colors select-none whitespace-nowrap"

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.invoices') || 'Facturas'}</h1>
          <p className="text-text-secondary mt-1">{allDocs.length} {(t('filter.invoices') || 'facturas').toLowerCase()}</p>
        </div>
        <Link
          href="/demo/new"
          className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
        >
          {t('invoices.new') || 'Nueva factura'}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-sm text-text-muted">{t('workspace.totalInvoiced') || 'Total facturado'}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalFacturado)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-sm text-text-muted">{t('invoices.created') || 'Creadas'}</p>
          <p className="text-2xl font-bold mt-1">{allDocs.filter(i => i.status === 'draft').length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-sm text-text-muted">{t('status.paid') || 'Pagadas'}</p>
          <p className="text-2xl font-bold mt-1">{allDocs.filter(i => i.status === 'paid').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary">
                <th className={`text-left ${thClass}`} onClick={() => toggleSort('invoiceNumber')}>
                  {t('table.number') || 'Numero'}<SortIcon active={sortField === 'invoiceNumber'} dir={sortDir} />
                </th>
                <th className={`text-left ${thClass}`} onClick={() => toggleSort('billToName')}>
                  {t('table.client') || 'Cliente'}<SortIcon active={sortField === 'billToName'} dir={sortDir} />
                </th>
                <th className={`text-left ${thClass} hidden sm:table-cell`} onClick={() => toggleSort('issueDate')}>
                  {t('table.date') || 'Fecha'}<SortIcon active={sortField === 'issueDate'} dir={sortDir} />
                </th>
                <th className={`text-right ${thClass}`} onClick={() => toggleSort('total')}>
                  {t('table.total') || 'Total'}<SortIcon active={sortField === 'total'} dir={sortDir} />
                </th>
                <th className={`text-center ${thClass}`} onClick={() => toggleSort('status')}>
                  {t('table.status') || 'Estado'}<SortIcon active={sortField === 'status'} dir={sortDir} />
                </th>
                <th className="text-right py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.actions') || 'Acciones'}</th>
              </tr>
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
                    <option value="">{t('filter.all') || 'Todos'}</option>
                    {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                  </select>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-text-muted">{t('workspace.noResults') || 'Sin resultados'}</td></tr>
              ) : filtered.map(invoice => {
                const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
                return (
                  <tr key={invoice.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                    <td className="py-3 px-4 font-medium">{invoice.invoiceNumber || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary">{invoice.billToName || '---'}</td>
                    <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{invoice.issueDate || '---'}</td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(invoice.total || 0, invoice.currency || 'EUR')}</td>
                    <td className="py-3 px-4 text-center">
                      <select value={invoice.status} onChange={e => {
                        updateInvoice(invoice.id, { status: e.target.value as InvoiceStatus })
                      }} className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusCfg.className}`}>
                        {Object.entries(STATUS_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/demo/edit/${invoice.id}`} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title={t('action.edit') || 'Editar'}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        {/* Delete disabled in demo */}
                        <button disabled className="p-1.5 text-text-muted/30 cursor-not-allowed rounded-lg" title={t('demo.noDelete') || 'Eliminar no disponible en demo'}>
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
    </div>
  )
}
