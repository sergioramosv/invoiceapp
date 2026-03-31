'use client'

import 'gridstack/dist/gridstack.min.css'
import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useDemo } from '@/lib/demo-context'
import { useI18n } from '@/lib/i18n'
import type { InvoiceStatus } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'

function formatCurrency(value: number, currency = 'EUR'): string {
  const symbols: Record<string, string> = { EUR: '\u20AC', USD: '$', GBP: '\u00A3', MXN: 'MX$' }
  return `${symbols[currency] || currency}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const MONTH_NAMES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: '#a3a3a3', emitted: '#0a0a0a', sent: '#6366f1', paid: '#22c55e', overdue: '#ef4444', cancelled: '#525252',
}

function KPICard({ label, value, subtitle, icon, color }: {
  label: string; value: string | number; subtitle?: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="h-full flex flex-col justify-center p-5 bg-surface border border-border rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
        <span className="text-sm text-text-muted font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-text">{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function DemoDashboard() {
  const { invoices } = useDemo()
  const { t, locale } = useI18n()
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInitialized = useRef(false)
  const monthNames = locale === 'es' ? MONTH_NAMES_ES : MONTH_NAMES_EN

  const allInvoices = useMemo(() => invoices.filter(i => i.documentType !== 'quote'), [invoices])
  const allQuotes = useMemo(() => invoices.filter(i => i.documentType === 'quote'), [invoices])

  const totalFacturado = useMemo(() => allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0), [allInvoices])
  const facturasEmitidas = allInvoices.length
  const presupuestosEmitidos = allQuotes.length
  const presupuestosAceptados = useMemo(() => allQuotes.filter(q => q.status === 'paid').length, [allQuotes])
  const tasaAceptacion = presupuestosEmitidos > 0 ? Math.round((presupuestosAceptados / presupuestosEmitidos) * 100) : 0

  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {}
    allInvoices.filter(i => i.status === 'paid').forEach(i => {
      const d = new Date(i.issueDate || i.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = (months[key] || 0) + (i.total || 0)
    })
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({ name: monthNames[d.getMonth()], total: months[key] || 0 })
    }
    return result
  }, [allInvoices, monthNames])

  const statusData = useMemo(() => {
    const statusLabels: Record<string, string> = {
      draft: t('status.draft'), sent: t('status.sent'), paid: t('status.paid'), overdue: t('status.overdue'), cancelled: t('status.cancelled'),
    }
    const counts: Record<string, number> = {}
    invoices.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1 })
    return Object.entries(counts).filter(([, v]) => v > 0).map(([status, count]) => ({
      name: statusLabels[status] || status, value: count, fill: STATUS_COLORS[status as InvoiceStatus] || '#a3a3a3',
    }))
  }, [invoices, t])

  const monthlyTrend = useMemo(() => {
    const invMap: Record<string, number> = {}; const quoMap: Record<string, number> = {}
    allInvoices.forEach(i => { const d = new Date(i.issueDate || i.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; invMap[key] = (invMap[key] || 0) + 1 })
    allQuotes.forEach(q => { const d = new Date(q.issueDate || q.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; quoMap[key] = (quoMap[key] || 0) + 1 })
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      result.push({ name: monthNames[d.getMonth()], facturas: invMap[key] || 0, presupuestos: quoMap[key] || 0 })
    }
    return result
  }, [allInvoices, allQuotes, monthNames])

  const recentDocs = useMemo(() => invoices.slice(0, 8), [invoices])

  // Initialize GridStack
  useEffect(() => {
    if (gridInitialized.current || !gridRef.current) return
    import('gridstack').then(({ GridStack }) => {
      if (!gridRef.current || gridInitialized.current) return
      gridInitialized.current = true
      GridStack.init({ column: 12, cellHeight: 70, margin: 8, animate: true, float: false, disableResize: false, disableDrag: false, resizable: { handles: 'se' } }, gridRef.current)
    })
  }, [])

  const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
    draft: { label: t('status.draft'), className: 'bg-text/10 text-text-secondary' },
    emitted: { label: t('status.emitted'), className: 'bg-primary/10 text-primary' },
    sent: { label: t('status.sent'), className: 'bg-accent/10 text-accent' },
    paid: { label: t('status.paid'), className: 'bg-success/10 text-success' },
    overdue: { label: t('status.overdue'), className: 'bg-danger/10 text-danger' },
    cancelled: { label: t('status.cancelled'), className: 'bg-text/5 text-text-muted' },
  }

  return (
    <div className="p-6 space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-text">{t('dashboard.title')}</h1>
        <p className="text-text-secondary text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div ref={gridRef} className="grid-stack">
        {/* KPI 1 */}
        <div className="grid-stack-item" gs-x="0" gs-y="0" gs-w="3" gs-h="2" gs-min-w="2" gs-min-h="2">
          <div className="grid-stack-item-content">
            <KPICard label={t('dashboard.totalRevenue')} value={formatCurrency(totalFacturado)} subtitle={t('dashboard.paidInvoices')} color="bg-success/15"
              icon={<svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          </div>
        </div>
        {/* KPI 2 */}
        <div className="grid-stack-item" gs-x="3" gs-y="0" gs-w="3" gs-h="2" gs-min-w="2" gs-min-h="2">
          <div className="grid-stack-item-content">
            <KPICard label={t('dashboard.invoicesIssued')} value={facturasEmitidas} subtitle={`${allInvoices.filter(i => i.status === 'paid').length} ${t('dashboard.paid')}`} color="bg-accent/15"
              icon={<svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          </div>
        </div>
        {/* KPI 3 */}
        <div className="grid-stack-item" gs-x="6" gs-y="0" gs-w="3" gs-h="2" gs-min-w="2" gs-min-h="2">
          <div className="grid-stack-item-content">
            <KPICard label={t('dashboard.quotesIssued')} value={presupuestosEmitidos} subtitle={`${allQuotes.filter(q => q.status === 'sent').length} ${t('dashboard.sent')}`} color="bg-warning/15"
              icon={<svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>} />
          </div>
        </div>
        {/* KPI 4 */}
        <div className="grid-stack-item" gs-x="9" gs-y="0" gs-w="3" gs-h="2" gs-min-w="2" gs-min-h="2">
          <div className="grid-stack-item-content">
            <KPICard label={t('dashboard.quotesAccepted')} value={presupuestosAceptados} subtitle={presupuestosEmitidos > 0 ? `${tasaAceptacion}% ${t('dashboard.conversionRate')}` : undefined} color="bg-success/15"
              icon={<svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
          </div>
        </div>

        {/* Chart: Monthly Revenue */}
        <div className="grid-stack-item" gs-x="0" gs-y="2" gs-w="8" gs-h="5" gs-min-w="4" gs-min-h="4">
          <div className="grid-stack-item-content">
            <div className="h-full bg-surface border border-border rounded-xl p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-text mb-4">{t('dashboard.monthlyRevenue')}</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={50} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-tertiary)' }} />
                    <Bar dataKey="total" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Chart: Status Distribution */}
        <div className="grid-stack-item" gs-x="8" gs-y="2" gs-w="4" gs-h="5" gs-min-w="3" gs-min-h="4">
          <div className="grid-stack-item-content">
            <div className="h-full bg-surface border border-border rounded-xl p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-text mb-4">{t('dashboard.statusDistribution')}</h3>
              {statusData.length > 0 ? (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={3} dataKey="value" stroke="none">
                          {statusData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [String(value), name]} contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {statusData.map((s) => (<div key={s.name} className="flex items-center gap-1.5 text-xs text-text-secondary"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.fill }} />{s.name} ({s.value})</div>))}
                  </div>
                </div>
              ) : (<div className="flex-1 flex items-center justify-center text-text-muted text-sm">{t('dashboard.noData')}</div>)}
            </div>
          </div>
        </div>

        {/* Chart: Activity Trend */}
        <div className="grid-stack-item" gs-x="0" gs-y="7" gs-w="6" gs-h="4" gs-min-w="4" gs-min-h="3">
          <div className="grid-stack-item-content">
            <div className="h-full bg-surface border border-border rounded-xl p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-text mb-4">{t('dashboard.activityTrend')}</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="facturas" stackId="1" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="presupuestos" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />{t('dashboard.invoicesLabel')}</div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0" />{t('dashboard.quotesLabel')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div className="grid-stack-item" gs-x="6" gs-y="7" gs-w="6" gs-h="4" gs-min-w="3" gs-min-h="3">
          <div className="grid-stack-item-content">
            <div className="h-full bg-surface border border-border rounded-xl p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-text mb-4">{t('dashboard.topClients')}</h3>
              <div className="flex-1 overflow-auto space-y-2">
                {(() => {
                  const clientTotals: Record<string, number> = {}
                  allInvoices.filter(i => i.status === 'paid' && i.billToName).forEach(i => { clientTotals[i.billToName!] = (clientTotals[i.billToName!] || 0) + (i.total || 0) })
                  const sorted = Object.entries(clientTotals).sort(([, a], [, b]) => b - a).slice(0, 5)
                  const maxVal = sorted[0]?.[1] || 1
                  if (sorted.length === 0) return <div className="flex-1 flex items-center justify-center text-text-muted text-sm">{t('dashboard.noData')}</div>
                  return sorted.map(([name, total]) => (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className="text-text truncate font-medium">{name}</span><span className="text-text-muted shrink-0 ml-2">{formatCurrency(total)}</span></div>
                      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(total / maxVal) * 100}%` }} /></div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="grid-stack-item" gs-x="0" gs-y="11" gs-w="12" gs-h="5" gs-min-w="6" gs-min-h="3">
          <div className="grid-stack-item-content">
            <div className="h-full bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-text">{t('dashboard.recentDocs')}</h3>
                <Link href="/demo/invoices" className="text-xs text-accent hover:text-accent-light transition-colors font-medium">{t('dashboard.viewAll')}</Link>
              </div>
              <div className="flex-1 overflow-auto">
                {recentDocs.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-secondary">
                        <th className="text-left py-2 px-4 font-semibold text-text-muted text-xs">{t('table.type')}</th>
                        <th className="text-left py-2 px-4 font-semibold text-text-muted text-xs">{t('table.number')}</th>
                        <th className="text-left py-2 px-4 font-semibold text-text-muted text-xs">{t('table.client')}</th>
                        <th className="text-right py-2 px-4 font-semibold text-text-muted text-xs">{t('table.total')}</th>
                        <th className="text-center py-2 px-4 font-semibold text-text-muted text-xs">{t('table.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDocs.map((doc) => {
                        const isQuote = doc.documentType === 'quote'
                        const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft
                        return (
                          <tr key={doc.id} className="border-b border-border-light last:border-0 hover:bg-surface-secondary transition-colors">
                            <td className="py-2 px-4"><span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${isQuote ? 'bg-warning/15 text-warning' : 'bg-accent/15 text-accent'}`}>{isQuote ? t('docType.quote') : t('docType.invoice')}</span></td>
                            <td className="py-2 px-4 font-medium text-text text-xs"><Link href={`/demo/edit/${doc.id}`} className="hover:text-accent transition-colors">{doc.invoiceNumber || '---'}</Link></td>
                            <td className="py-2 px-4 text-text-secondary text-xs">{doc.billToName || '---'}</td>
                            <td className="py-2 px-4 text-right font-medium text-text text-xs">{formatCurrency(doc.total || 0, doc.currency || 'EUR')}</td>
                            <td className="py-2 px-4 text-center"><span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${statusCfg.className}`}>{statusCfg.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (<div className="flex-1 flex items-center justify-center p-8 text-text-muted text-sm">{t('dashboard.noDocs')}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
