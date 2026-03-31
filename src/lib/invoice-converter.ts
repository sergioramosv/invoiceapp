import { uid } from '@/lib/uid'
import {
  InvoiceState,
  CURRENCIES,
  LANGUAGES,
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
  getVatBreakdown,
  createInitialState,
  DEFAULT_VAT_LINES,
} from '@/types/invoice'
import type { Invoice } from '@/types'

export function invoiceStateToFirestore(
  state: InvoiceState,
  userId: string,
  status: Invoice['status'] = 'draft'
): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    templateStyle: state.templateStyle || 'default',
    documentType: state.documentType || 'invoice',
    title: state.title || '',
    invoiceNumber: state.invoiceNumber || '',
    invoiceType: state.invoiceType || 'F1',
    status,
    currency: state.currency.code,
    language: state.language.code,
    issueDate: state.issueDate || '',
    dueDate: state.dueDate || '',
    fromName: state.fromName || '',
    fromEmail: state.fromEmail || '',
    fromAddress: state.fromAddress || '',
    fromPhone: state.fromPhone || '',
    fromTaxId: state.fromTaxId || '',
    fromLogoUrl: state.logoUrl || '',
    billToName: state.billToName || '',
    billToEmail: state.billToEmail || '',
    billToAddress: state.billToAddress || '',
    billToPhone: state.billToPhone || '',
    billToTaxId: state.billToTaxId || '',
    shipToName: state.showShipping ? state.shipToName || '' : '',
    shipToAddress: state.showShipping ? state.shipToAddress || '' : '',
    subtotal: getSubtotal(state),
    taxRate: state.taxRate,
    taxAmount: getTaxAmount(state),
    discountRate: state.discountRate,
    discountAmount: getDiscountAmount(state),
    shippingAmount: state.shippingAmount,
    total: getTotal(state),
    amountPaid: state.amountPaid,
    balanceDue: getBalanceDue(state),
    vatBreakdown: getVatBreakdown(state),
    notes: state.notes || '',
    terms: state.terms || '',
    signatureUrl: state.signatureUrl || '',
    signatureLabel: state.signatureLabel || '',
    signatures: state.signatures || [],
    items: state.items.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    })),
    // Rectificativa (empty string instead of undefined — Firestore rejects undefined)
    rectifiedInvoiceId: state.rectifiedInvoiceId || '',
    rectifiedInvoiceNumber: state.rectifiedInvoiceNumber || '',
    rectificationReason: state.rectificationReason || '',
  }
}

export function firestoreToInvoiceState(invoice: Invoice): InvoiceState {
  const base = createInitialState()
  const currency = CURRENCIES.find((c) => c.code === invoice.currency) || base.currency
  const language = LANGUAGES.find((l) => l.code === invoice.language) || base.language

  // Reconstruct vatLines from vatBreakdown or fallback to taxRate
  let vatLines = [...DEFAULT_VAT_LINES]
  if (invoice.vatBreakdown && invoice.vatBreakdown.length > 0) {
    vatLines = invoice.vatBreakdown.map((vb, idx) => ({
      id: `vat-${vb.rate}-${idx}`,
      rate: vb.rate,
      label: vb.rate === 0 ? 'Exento' : `IVA ${vb.rate}%`,
    }))
  } else if (invoice.taxRate && invoice.taxRate > 0) {
    vatLines = [{ id: 'vat-legacy', rate: invoice.taxRate, label: `IVA ${invoice.taxRate}%` }]
  }

  // Assign vatLineId to items if not present
  const defaultVatLineId = vatLines[0]?.id || 'vat-21'

  return {
    templateStyle: (invoice.templateStyle as InvoiceState['templateStyle']) || 'default',
    documentType: invoice.documentType || 'invoice',
    title: invoice.title || base.title,
    currency,
    language,
    invoiceNumber: invoice.invoiceNumber || '',
    invoiceType: invoice.invoiceType || 'F1',
    issueDate: invoice.issueDate || base.issueDate,
    dueDate: invoice.dueDate || '',
    customFields: [],
    fromName: invoice.fromName || '',
    fromEmail: invoice.fromEmail || '',
    fromAddress: invoice.fromAddress || '',
    fromPhone: invoice.fromPhone || '',
    fromTaxId: invoice.fromTaxId || '',
    logoUrl: invoice.fromLogoUrl || '',
    billToName: invoice.billToName || '',
    billToEmail: invoice.billToEmail || '',
    billToAddress: invoice.billToAddress || '',
    billToPhone: invoice.billToPhone || '',
    billToTaxId: invoice.billToTaxId || '',
    showShipping: !!(invoice.shipToName || invoice.shipToAddress),
    shipToName: invoice.shipToName || '',
    shipToAddress: invoice.shipToAddress || '',
    items: invoice.items && invoice.items.length > 0
      ? invoice.items.map((item) => ({
          id: item.id || uid(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          vatLineId: item.vatLineId || defaultVatLineId,
        }))
      : base.items,
    vatLines,
    discountRate: invoice.discountRate || 0,
    taxRate: invoice.taxRate || 0,
    shippingAmount: invoice.shippingAmount || 0,
    amountPaid: invoice.amountPaid || 0,
    bankFields: [],
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    signatureUrl: invoice.signatureUrl || '',
    signatureLabel: invoice.signatureLabel || '',
    signatures: (invoice as Record<string, unknown>).signatures as InvoiceState['signatures'] || [],
    // VeriFactu (read-only)
    verifactuStatus: invoice.verifactuStatus || 'none',
    verifactuHash: invoice.verifactuHash || '',
    verifactuQrUrl: invoice.verifactuQrUrl || '',
    emittedAt: invoice.emittedAt || '',
    // Rectificativa
    rectifiedInvoiceId: invoice.rectifiedInvoiceId || '',
    rectifiedInvoiceNumber: invoice.rectifiedInvoiceNumber || '',
    rectificationReason: invoice.rectificationReason || '',
  }
}
