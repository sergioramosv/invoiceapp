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
    templateStyle: state.templateStyle || 'default',
    documentType: state.documentType || 'invoice',
    title: state.title || '',
    invoiceNumber: state.invoiceNumber || '',
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
    notes: state.notes || '',
    terms: state.terms || '',
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
    templateStyle: (invoice.templateStyle as InvoiceState['templateStyle']) || 'default',
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
