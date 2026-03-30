'use client'

import { InvoiceState } from '@/types/invoice'
import type { TemplateStyle } from '@/lib/invoice-templates'

interface InvoicePreviewProps {
  state: InvoiceState
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  balanceDue: number
}

function fmt(value: number, symbol: string): string {
  return `${symbol}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function InvoicePreview({
  state,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  balanceDue,
}: InvoicePreviewProps) {
  const labels = state.language.labels
  const sym = state.currency.symbol
  const tmpl: TemplateStyle = state.templateStyle || 'default'

  /* ── Container classes ── */
  const containerClass = [
    'text-text',
    tmpl === 'default' && 'p-8',
    tmpl === 'minimal' && 'p-10',
    tmpl === 'corporate' && 'overflow-hidden',
    tmpl === 'creative' && 'p-8 relative overflow-hidden',
  ]
    .filter(Boolean)
    .join(' ')

  /* ── Corporate header band ── */
  const showCorporateHeader = tmpl === 'corporate'

  /* ── Creative left accent bar ── */
  const showCreativeAccent = tmpl === 'creative'

  return (
    <div className={containerClass}>
      {/* Creative accent bar */}
      {showCreativeAccent && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
      )}

      {/* Corporate dark header */}
      {showCorporateHeader && (
        <div className="bg-text text-white px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {state.logoUrl && (
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xs">
                <img src={state.logoUrl} alt="Logo" className="h-8 object-contain" />
              </div>
            )}
            <p className="text-lg font-bold">{state.fromName || 'Empresa'}</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">
              {state.title || labels.invoice}
            </h1>
            {state.invoiceNumber && (
              <p className="text-sm text-white/70 mt-0.5">{labels.invoiceNumber}: {state.invoiceNumber}</p>
            )}
          </div>
        </div>
      )}

      {/* Content wrapper for corporate (adds padding below header) */}
      <div className={showCorporateHeader ? 'p-8' : tmpl === 'creative' ? 'pl-4' : ''}>
        {/* Top: Logo + From (left) | Title + Meta (right) — skip for corporate which has its own header */}
        {tmpl !== 'corporate' && (
          <div className={`flex justify-between items-start gap-6 ${tmpl === 'minimal' ? 'mb-10' : 'mb-8'}`}>
            {/* Left: From info */}
            <div className="space-y-1 min-w-0 flex-1">
              {state.logoUrl ? (
                <div className="mb-3">
                  <img src={state.logoUrl} alt="Logo" className="h-14 max-w-[140px] object-contain" />
                </div>
              ) : tmpl !== 'minimal' ? (
                <div className="mb-3">
                  <div className="w-14 h-14 bg-surface-tertiary rounded-lg flex items-center justify-center text-xs text-text-muted">
                    Logo
                  </div>
                </div>
              ) : null}
              {state.fromName && (
                <p className={`font-bold ${tmpl === 'creative' ? 'text-xl text-accent' : 'text-lg'}`}>
                  {state.fromName}
                </p>
              )}
              {state.fromAddress && (
                <p className={`whitespace-pre-line ${tmpl === 'minimal' ? 'text-xs text-text-muted' : 'text-sm text-text-secondary'}`}>
                  {state.fromAddress}
                </p>
              )}
              {state.fromEmail && (
                <p className={tmpl === 'minimal' ? 'text-xs text-text-muted' : 'text-sm text-text-secondary'}>
                  {state.fromEmail}
                </p>
              )}
              {state.fromPhone && (
                <p className={tmpl === 'minimal' ? 'text-xs text-text-muted' : 'text-sm text-text-secondary'}>
                  {state.fromPhone}
                </p>
              )}
              {state.fromTaxId && (
                <p className={tmpl === 'minimal' ? 'text-xs text-text-muted' : 'text-sm text-text-secondary'}>
                  NIF: {state.fromTaxId}
                </p>
              )}
            </div>

            {/* Right: Title + metadata */}
            <div className="text-right shrink-0">
              <h1 className={[
                'font-bold mb-3',
                tmpl === 'default' && 'text-2xl text-primary',
                tmpl === 'minimal' && 'text-xl text-text',
                tmpl === 'creative' && 'text-3xl text-accent',
              ].filter(Boolean).join(' ')}>
                {state.title || labels.invoice}
              </h1>
              <div className={`space-y-1 ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
                {state.invoiceNumber && (
                  <p>
                    <span className="text-text-secondary">{labels.invoiceNumber}: </span>
                    <span className="font-medium">{state.invoiceNumber}</span>
                  </p>
                )}
                {state.issueDate && (
                  <p>
                    <span className="text-text-secondary">{labels.issueDate}: </span>
                    <span className="font-medium">{state.issueDate}</span>
                  </p>
                )}
                {state.dueDate && (
                  <p>
                    <span className="text-text-secondary">{labels.dueDate}: </span>
                    <span className="font-medium">{state.dueDate}</span>
                  </p>
                )}
                {state.customFields.map(
                  (field) =>
                    field.label &&
                    field.value && (
                      <p key={field.id}>
                        <span className="text-text-secondary">{field.label}: </span>
                        <span className="font-medium">{field.value}</span>
                      </p>
                    )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Corporate: from info + dates below header */}
        {tmpl === 'corporate' && (
          <div className="flex justify-between items-start gap-6 mb-8">
            <div className="space-y-1 min-w-0 flex-1">
              {state.fromAddress && (
                <p className="text-sm text-text-secondary whitespace-pre-line">{state.fromAddress}</p>
              )}
              {state.fromEmail && <p className="text-sm text-text-secondary">{state.fromEmail}</p>}
              {state.fromPhone && <p className="text-sm text-text-secondary">{state.fromPhone}</p>}
              {state.fromTaxId && <p className="text-sm text-text-secondary">NIF: {state.fromTaxId}</p>}
            </div>
            <div className="text-right text-sm space-y-1 shrink-0">
              {state.issueDate && (
                <p>
                  <span className="text-text-secondary">{labels.issueDate}: </span>
                  <span className="font-medium">{state.issueDate}</span>
                </p>
              )}
              {state.dueDate && (
                <p>
                  <span className="text-text-secondary">{labels.dueDate}: </span>
                  <span className="font-medium">{state.dueDate}</span>
                </p>
              )}
              {state.customFields.map(
                (field) =>
                  field.label &&
                  field.value && (
                    <p key={field.id}>
                      <span className="text-text-secondary">{field.label}: </span>
                      <span className="font-medium">{field.value}</span>
                    </p>
                  )
              )}
            </div>
          </div>
        )}

        {/* Bill To / Ship To */}
        <div className={`grid grid-cols-2 gap-6 ${tmpl === 'minimal' ? 'mb-10' : 'mb-8'}`}>
          <div>
            <h3 className={[
              'font-bold uppercase mb-2 tracking-wider',
              tmpl === 'creative' ? 'text-xs text-accent' : 'text-xs text-text-secondary',
            ].filter(Boolean).join(' ')}>
              {labels.billTo}
            </h3>
            <div className={`space-y-0.5 ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
              {state.billToName && <p className="font-medium">{state.billToName}</p>}
              {state.billToAddress && (
                <p className="text-text-secondary whitespace-pre-line">{state.billToAddress}</p>
              )}
              {state.billToEmail && <p className="text-text-secondary">{state.billToEmail}</p>}
              {state.billToPhone && <p className="text-text-secondary">{state.billToPhone}</p>}
              {state.billToTaxId && <p className="text-text-secondary">NIF: {state.billToTaxId}</p>}
              {!state.billToName && !state.billToAddress && !state.billToEmail && (
                <p className="text-text-muted italic">---</p>
              )}
            </div>
          </div>
          {state.showShipping && (
            <div>
              <h3 className={[
                'font-bold uppercase mb-2 tracking-wider',
                tmpl === 'creative' ? 'text-xs text-accent' : 'text-xs text-text-secondary',
              ].filter(Boolean).join(' ')}>
                {labels.shipTo}
              </h3>
              <div className={`space-y-0.5 ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
                {state.shipToName && <p className="font-medium">{state.shipToName}</p>}
                {state.shipToAddress && (
                  <p className="text-text-secondary whitespace-pre-line">{state.shipToAddress}</p>
                )}
                {!state.shipToName && !state.shipToAddress && (
                  <p className="text-text-muted italic">---</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="mb-6">
          <table className={`w-full ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
            <thead>
              <tr className={[
                tmpl === 'default' && 'border-b-2 border-primary/20',
                tmpl === 'minimal' && 'border-b border-text/10',
                tmpl === 'corporate' && 'bg-surface-tertiary border-b border-border',
                tmpl === 'creative' && 'border-b-2 border-accent/30',
              ].filter(Boolean).join(' ')}>
                <th className={`text-left py-2 font-semibold ${tmpl === 'creative' ? 'text-accent' : 'text-text-secondary'}`}>
                  {labels.item}
                </th>
                <th className={`text-center py-2 font-semibold w-20 ${tmpl === 'creative' ? 'text-accent' : 'text-text-secondary'}`}>
                  {labels.quantity}
                </th>
                <th className={`text-right py-2 font-semibold w-24 ${tmpl === 'creative' ? 'text-accent' : 'text-text-secondary'}`}>
                  {labels.price}
                </th>
                <th className={`text-right py-2 font-semibold w-28 ${tmpl === 'creative' ? 'text-accent' : 'text-text-secondary'}`}>
                  {labels.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={[
                    tmpl === 'default' && 'border-b border-border/60',
                    tmpl === 'minimal' && '',
                    tmpl === 'corporate' && (idx % 2 === 0 ? 'bg-surface-secondary' : 'bg-white'),
                    tmpl === 'creative' && 'border-b border-border/40',
                  ].filter(Boolean).join(' ')}
                >
                  <td className={tmpl === 'minimal' ? 'py-3' : 'py-2.5'}>
                    {item.description || (
                      <span className="text-text-muted italic">---</span>
                    )}
                  </td>
                  <td className={`text-center ${tmpl === 'minimal' ? 'py-3' : 'py-2.5'}`}>
                    {item.quantity}
                  </td>
                  <td className={`text-right ${tmpl === 'minimal' ? 'py-3' : 'py-2.5'}`}>
                    {fmt(item.unitPrice, sym)}
                  </td>
                  <td className={`text-right font-medium ${tmpl === 'minimal' ? 'py-3' : 'py-2.5'}`}>
                    {fmt(item.amount, sym)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className={[
            'w-64 space-y-1.5',
            tmpl === 'minimal' ? 'text-xs' : 'text-sm',
            tmpl === 'creative' && 'bg-accent/5 rounded-xl p-4',
          ].filter(Boolean).join(' ')}>
            <div className="flex justify-between">
              <span className="text-text-secondary">{labels.subtotal}</span>
              <span>{fmt(subtotal, sym)}</span>
            </div>
            {state.discountRate > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {labels.discount} ({state.discountRate}%)
                </span>
                <span className="text-danger">-{fmt(discountAmount, sym)}</span>
              </div>
            )}
            {state.taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  {labels.tax} ({state.taxRate}%)
                </span>
                <span>{fmt(taxAmount, sym)}</span>
              </div>
            )}
            {state.shippingAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Envio</span>
                <span>{fmt(state.shippingAmount, sym)}</span>
              </div>
            )}
            <div className={[
              'flex justify-between pt-2 font-bold',
              tmpl === 'minimal' ? 'border-t border-text/10 text-sm' : 'border-t border-border text-base',
              tmpl === 'creative' && 'text-accent border-accent/30',
            ].filter(Boolean).join(' ')}>
              <span>{labels.total}</span>
              <span>{fmt(total, sym)}</span>
            </div>
            {state.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-text-secondary">
                  <span>Pagado</span>
                  <span>-{fmt(state.amountPaid, sym)}</span>
                </div>
                <div
                  className={`flex justify-between font-bold text-base ${balanceDue > 0 ? 'text-danger' : 'text-success'}`}
                >
                  <span>Saldo pendiente</span>
                  <span>{fmt(balanceDue, sym)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bank info */}
        {state.bankFields.length > 0 &&
          state.bankFields.some((f) => f.label || f.value) && (
            <div className={[
              'pt-4 mb-6',
              tmpl === 'minimal' ? 'border-t border-text/10' : 'border-t border-border',
            ].filter(Boolean).join(' ')}>
              <h3 className={[
                'font-bold uppercase mb-2 tracking-wider',
                tmpl === 'creative' ? 'text-xs text-accent' : 'text-xs text-text-secondary',
              ].filter(Boolean).join(' ')}>
                {labels.bankInfo}
              </h3>
              <div className={`space-y-0.5 ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
                {state.bankFields.map(
                  (field) =>
                    (field.label || field.value) && (
                      <p key={field.id}>
                        <span className="text-text-secondary">
                          {field.label || 'Campo'}:{' '}
                        </span>
                        <span className="font-medium">{field.value}</span>
                      </p>
                    )
                )}
              </div>
            </div>
          )}

        {/* Notes */}
        {state.notes && (
          <div className={[
            'pt-4 mb-4',
            tmpl === 'minimal' ? 'border-t border-text/10' : 'border-t border-border',
          ].filter(Boolean).join(' ')}>
            <h3 className={[
              'font-bold uppercase mb-1 tracking-wider',
              tmpl === 'creative' ? 'text-xs text-accent' : 'text-xs text-text-secondary',
            ].filter(Boolean).join(' ')}>
              {labels.notes}
            </h3>
            <p className={`text-text-secondary whitespace-pre-line ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
              {state.notes}
            </p>
          </div>
        )}

        {/* Terms */}
        {state.terms && (
          <div className={[
            'pt-4',
            tmpl === 'minimal' ? 'border-t border-text/10' : 'border-t border-border',
          ].filter(Boolean).join(' ')}>
            <h3 className={[
              'font-bold uppercase mb-1 tracking-wider',
              tmpl === 'creative' ? 'text-xs text-accent' : 'text-xs text-text-secondary',
            ].filter(Boolean).join(' ')}>
              Terminos
            </h3>
            <p className={`text-text-secondary whitespace-pre-line ${tmpl === 'minimal' ? 'text-xs' : 'text-sm'}`}>
              {state.terms}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
