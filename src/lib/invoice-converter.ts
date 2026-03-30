import {
  InvoiceState,
  CURRENCIES,
  LANGUAGES,
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
  createInitialState,
} from '@/types/invoice'
import type { Invoice } from '@/types'

export function invoiceStateToFirestore(
  state: InvoiceState,
  userId: string,
  status: Invoice['status'] = 'draft'
): Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    documentType: state.documentType,
    title: state.title,
    invoiceNumber: state.invoiceNumber,
    status,
    currency: state.currency.code,
    language: state.language.code,
    issueDate: state.issueDate,
    dueDate: state.dueDate || undefined,
    fromName: state.fromName || undefined,
    fromEmail: state.fromEmail || undefined,
    fromAddress: state.fromAddress || undefined,
    fromPhone: state.fromPhone || undefined,
    fromTaxId: state.fromTaxId || undefined,
    fromLogoUrl: state.logoUrl || undefined,
    billToName: state.billToName || undefined,
    billToEmail: state.billToEmail || undefined,
    billToAddress: state.billToAddress || undefined,
    billToPhone: state.billToPhone || undefined,
    billToTaxId: state.billToTaxId || undefined,
    shipToName: state.showShipping ? state.shipToName || undefined : undefined,
    shipToAddress: state.showShipping ? state.shipToAddress || undefined : undefined,
    subtotal: getSubtotal(state),
    taxRate: state.taxRate,
    taxAmount: getTaxAmount(state),
    discountRate: state.discountRate,
    discountAmount: getDiscountAmount(state),
    shippingAmount: state.shippingAmount,
    total: getTotal(state),
    amountPaid: state.amountPaid,
    balanceDue: getBalanceDue(state),
    notes: state.notes || undefined,
    terms: state.terms || undefined,
    items: state.items.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    })),
  }
}

export function firestoreToInvoiceState(invoice: Invoice): InvoiceState {
  const base = createInitialState()
  const currency = CURRENCIES.find((c) => c.code === invoice.currency) || base.currency
  const language = LANGUAGES.find((l) => l.code === invoice.language) || base.language

  return {
    documentType: invoice.documentType || 'invoice',
    title: invoice.title || base.title,
    currency,
    language,
    invoiceNumber: invoice.invoiceNumber || '',
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
          id: item.id || crypto.randomUUID(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        }))
      : base.items,
    discountRate: invoice.discountRate || 0,
    taxRate: invoice.taxRate || 0,
    shippingAmount: invoice.shippingAmount || 0,
    amountPaid: invoice.amountPaid || 0,
    bankFields: [],
    notes: invoice.notes || '',
    terms: invoice.terms || '',
  }
}
