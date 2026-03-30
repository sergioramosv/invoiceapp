'use client'

import { InvoiceState } from '@/types/invoice'

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

  return (
    <div className="bg-white p-8 shadow-sm border border-border rounded-xl text-text">
      {/* Top: Logo + From (left) | Title + Meta (right) */}
      <div className="flex justify-between items-start gap-6 mb-8">
        {/* Left: From info */}
        <div className="space-y-1 min-w-0 flex-1">
          {state.logoUrl && (
            <div className="mb-3">
              <div className="w-16 h-16 bg-surface-tertiary rounded-lg flex items-center justify-center text-xs text-text-secondary">
                Logo
              </div>
            </div>
          )}
          {state.fromName && (
            <p className="text-lg font-bold">{state.fromName}</p>
          )}
          {state.fromAddress && (
            <p className="text-sm text-text-secondary whitespace-pre-line">
              {state.fromAddress}
            </p>
          )}
          {state.fromEmail && (
            <p className="text-sm text-text-secondary">{state.fromEmail}</p>
          )}
          {state.fromPhone && (
            <p className="text-sm text-text-secondary">{state.fromPhone}</p>
          )}
          {state.fromTaxId && (
            <p className="text-sm text-text-secondary">NIF: {state.fromTaxId}</p>
          )}
        </div>

        {/* Right: Title + metadata */}
        <div className="text-right shrink-0">
          <h1 className="text-2xl font-bold text-primary mb-3">
            {state.title || labels.invoice}
          </h1>
          <div className="space-y-1 text-sm">
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

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase text-text-secondary mb-2 tracking-wider">
            {labels.billTo}
          </h3>
          <div className="space-y-0.5 text-sm">
            {state.billToName && <p className="font-medium">{state.billToName}</p>}
            {state.billToAddress && (
              <p className="text-text-secondary whitespace-pre-line">
                {state.billToAddress}
              </p>
            )}
            {state.billToEmail && (
              <p className="text-text-secondary">{state.billToEmail}</p>
            )}
            {state.billToPhone && (
              <p className="text-text-secondary">{state.billToPhone}</p>
            )}
            {state.billToTaxId && (
              <p className="text-text-secondary">NIF: {state.billToTaxId}</p>
            )}
            {!state.billToName &&
              !state.billToAddress &&
              !state.billToEmail && (
                <p className="text-text-muted italic">---</p>
              )}
          </div>
        </div>
        {state.showShipping && (
          <div>
            <h3 className="text-xs font-bold uppercase text-text-secondary mb-2 tracking-wider">
              {labels.shipTo}
            </h3>
            <div className="space-y-0.5 text-sm">
              {state.shipToName && <p className="font-medium">{state.shipToName}</p>}
              {state.shipToAddress && (
                <p className="text-text-secondary whitespace-pre-line">
                  {state.shipToAddress}
                </p>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-2 font-semibold text-text-secondary">
                {labels.item}
              </th>
              <th className="text-center py-2 font-semibold text-text-secondary w-20">
                {labels.quantity}
              </th>
              <th className="text-right py-2 font-semibold text-text-secondary w-24">
                {labels.price}
              </th>
              <th className="text-right py-2 font-semibold text-text-secondary w-28">
                {labels.amount}
              </th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="py-2.5">
                  {item.description || (
                    <span className="text-text-muted italic">---</span>
                  )}
                </td>
                <td className="py-2.5 text-center">{item.quantity}</td>
                <td className="py-2.5 text-right">{fmt(item.unitPrice, sym)}</td>
                <td className="py-2.5 text-right font-medium">
                  {fmt(item.amount, sym)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5 text-sm">
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
              <span className="text-text-secondary">Envío</span>
              <span>{fmt(state.shippingAmount, sym)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-bold text-base">
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
          <div className="border-t border-border pt-4 mb-6">
            <h3 className="text-xs font-bold uppercase text-text-secondary mb-2 tracking-wider">
              {labels.bankInfo}
            </h3>
            <div className="space-y-0.5 text-sm">
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
        <div className="border-t border-border pt-4 mb-4">
          <h3 className="text-xs font-bold uppercase text-text-secondary mb-1 tracking-wider">
            {labels.notes}
          </h3>
          <p className="text-sm text-text-secondary whitespace-pre-line">
            {state.notes}
          </p>
        </div>
      )}

      {/* Terms */}
      {state.terms && (
        <div className="border-t border-border pt-4">
          <h3 className="text-xs font-bold uppercase text-text-secondary mb-1 tracking-wider">
            Términos
          </h3>
          <p className="text-sm text-text-secondary whitespace-pre-line">
            {state.terms}
          </p>
        </div>
      )}
    </div>
  )
}
