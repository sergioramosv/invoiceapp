'use client'

import { useState, useEffect } from 'react'
import { InvoiceState, getVatBreakdown } from '@/types/invoice'
import type { TemplateStyle } from '@/lib/invoice-templates'

/** QR code: generates real QR from URL, shows placeholder while loading or if no URL */
function VerifactuQr({ url }: { url?: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (!url) { setQrDataUrl(''); return }
    let cancelled = false
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(url, { width: 160, margin: 1, errorCorrectionLevel: 'M' })
        .then((dataUrl: string) => { if (!cancelled) setQrDataUrl(dataUrl) })
        .catch(() => {})
    }).catch(() => {})
    return () => { cancelled = true }
  }, [url])

  if (qrDataUrl) {
    return <img src={qrDataUrl} alt="QR VeriFactu" className="w-20 h-20" />
  }

  // SVG placeholder
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      <rect width="80" height="80" fill="white" stroke="#e5e5e5" strokeWidth="1" rx="4" />
      <rect x="6" y="6" width="20" height="20" fill="#d4d4d4" rx="2" />
      <rect x="10" y="10" width="12" height="12" fill="white" rx="1" />
      <rect x="13" y="13" width="6" height="6" fill="#d4d4d4" rx="1" />
      <rect x="54" y="6" width="20" height="20" fill="#d4d4d4" rx="2" />
      <rect x="58" y="10" width="12" height="12" fill="white" rx="1" />
      <rect x="61" y="13" width="6" height="6" fill="#d4d4d4" rx="1" />
      <rect x="6" y="54" width="20" height="20" fill="#d4d4d4" rx="2" />
      <rect x="10" y="58" width="12" height="12" fill="white" rx="1" />
      <rect x="13" y="61" width="6" height="6" fill="#d4d4d4" rx="1" />
      {[30,36,42,48,54].map(x =>
        [30,36,42,48,54,60].map(y =>
          (x + y) % 8 < 5 ? <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="#d4d4d4" rx="0.5" /> : null
        )
      )}
    </svg>
  )
}

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
  const vatBreakdown = getVatBreakdown(state)
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
                    tmpl === 'corporate' && (idx % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white'),
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
            {vatBreakdown.map((line, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-text-secondary">
                  {line.rate === 0 ? 'Exento' : `${labels.tax} ${line.rate}%`}
                </span>
                <span>{fmt(line.quota, sym)}</span>
              </div>
            ))}
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

        {/* VeriFactu QR Code - always shown for invoices */}
        {state.documentType !== 'quote' && (
          <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
            <div className="text-[9px] text-text-muted max-w-[200px]">
              <p className="font-medium mb-0.5">Factura verificable — VeriFactu</p>
              <p>Puede verificar esta factura en la sede electrónica de la AEAT</p>
              {state.verifactuHash ? (
                <p className="font-mono mt-1 break-all">{state.verifactuHash.slice(0, 16)}...</p>
              ) : (
                <p className="font-mono mt-1 text-text-muted/50">Hash pendiente de emisión</p>
              )}
            </div>
            <VerifactuQr url={state.verifactuQrUrl} />
          </div>
        )}

        {/* Signatures / Stamps */}
        {(state.signatureUrl || state.signatureLabel || (state.signatures && state.signatures.length > 0)) && (
          <div className="mt-8 flex justify-end gap-6 flex-wrap">
            {(state.signatureUrl || state.signatureLabel) && (
              <div className="text-center">
                {state.signatureUrl && (
                  <img src={state.signatureUrl} alt="Firma" className="h-20 object-contain" />
                )}
                <div className="border-t border-border mt-2 pt-1">
                  <p className="text-xs text-text-muted">{state.signatureLabel || 'Firma / Sello'}</p>
                </div>
              </div>
            )}
            {state.signatures?.map((sig) => (
              (sig.url || sig.label) && (
                <div key={sig.id} className="text-center">
                  {sig.url && (
                    <img src={sig.url} alt="Firma" className="h-20 object-contain" />
                  )}
                  <div className="border-t border-border mt-2 pt-1">
                    <p className="text-xs text-text-muted">{sig.label || 'Firma / Sello'}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
