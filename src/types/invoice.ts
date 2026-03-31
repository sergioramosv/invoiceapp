import { uid } from '@/lib/uid'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  vatLineId?: string
}

export interface VatLine {
  id: string
  rate: number
  label: string
}

export interface SignatureEntry {
  id: string
  url: string
  label: string
}

export interface CustomField {
  id: string
  label: string
  type: 'text' | 'date'
  value: string
}

export interface BankField {
  id: string
  label: string
  value: string
}

export type Currency = { code: string; symbol: string; name: string }

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

export const LANGUAGES = [
  {
    code: 'es',
    name: 'Español',
    labels: {
      invoice: 'Factura',
      billTo: 'Facturar a',
      shipTo: 'Enviar a',
      from: 'De',
      item: 'Concepto',
      quantity: 'Cantidad',
      price: 'Precio',
      amount: 'Importe',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      tax: 'Impuestos',
      total: 'Total',
      notes: 'Notas',
      bankInfo: 'Datos bancarios',
      dueDate: 'Fecha vencimiento',
      issueDate: 'Fecha emisión',
      invoiceNumber: 'Nº Factura',
    },
  },
  {
    code: 'en',
    name: 'English',
    labels: {
      invoice: 'Invoice',
      billTo: 'Bill To',
      shipTo: 'Ship To',
      from: 'From',
      item: 'Item',
      quantity: 'Quantity',
      price: 'Price',
      amount: 'Amount',
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Tax',
      total: 'Total',
      notes: 'Notes',
      bankInfo: 'Bank Information',
      dueDate: 'Due Date',
      issueDate: 'Issue Date',
      invoiceNumber: 'Invoice Number',
    },
  },
  {
    code: 'de',
    name: 'Deutsch',
    labels: {
      invoice: 'Rechnung',
      billTo: 'Rechnungsadresse',
      shipTo: 'Lieferadresse',
      from: 'Von',
      item: 'Posten',
      quantity: 'Menge',
      price: 'Preis',
      amount: 'Betrag',
      subtotal: 'Zwischensumme',
      discount: 'Rabatt',
      tax: 'Steuer',
      total: 'Gesamt',
      notes: 'Anmerkungen',
      bankInfo: 'Bankverbindung',
      dueDate: 'Fälligkeitsdatum',
      issueDate: 'Rechnungsdatum',
      invoiceNumber: 'Rechnungsnummer',
    },
  },
] as const

export type Language = (typeof LANGUAGES)[number]

export type DocumentType = 'invoice' | 'quote'

export const DOCUMENT_TYPES: { value: DocumentType; labels: Record<string, string> }[] = [
  { value: 'invoice', labels: { es: 'Factura', en: 'Invoice', de: 'Rechnung' } },
  { value: 'quote', labels: { es: 'Presupuesto', en: 'Quote', de: 'Angebot' } },
]

import type { TemplateStyle } from '@/lib/invoice-templates'
import type { VeriFactuInvoiceType, VeriFactuStatus, VatBreakdownLine } from '@/types'

export interface InvoiceState {
  templateStyle: TemplateStyle
  documentType: DocumentType
  title: string
  currency: Currency
  language: Language
  invoiceNumber: string
  invoiceType: VeriFactuInvoiceType
  issueDate: string
  dueDate: string
  customFields: CustomField[]
  // From
  fromName: string
  fromEmail: string
  fromAddress: string
  fromPhone: string
  fromTaxId: string
  logoUrl: string
  // Bill to
  billToName: string
  billToEmail: string
  billToAddress: string
  billToPhone: string
  billToTaxId: string
  // Ship to
  showShipping: boolean
  shipToName: string
  shipToAddress: string
  // Items
  items: InvoiceItem[]
  // VAT
  vatLines: VatLine[]
  // Totals
  discountRate: number
  taxRate: number
  shippingAmount: number
  amountPaid: number
  // Bank
  bankFields: BankField[]
  // Notes
  notes: string
  terms: string
  signatureUrl: string
  signatureLabel: string
  signatures: SignatureEntry[]
  // VeriFactu (read-only in UI, set by server)
  verifactuStatus?: VeriFactuStatus
  verifactuHash?: string
  verifactuQrUrl?: string
  emittedAt?: string
  // Rectificativa
  rectifiedInvoiceId?: string
  rectifiedInvoiceNumber?: string
  rectificationReason?: string
}

function getTodayISO(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export const DEFAULT_VAT_LINES: VatLine[] = [
  { id: 'vat-21', rate: 21, label: 'IVA 21%' },
]

export function createInitialState(): InvoiceState {
  const defaultVatLine = DEFAULT_VAT_LINES[0]
  return {
    templateStyle: 'default',
    documentType: 'invoice',
    title: 'Factura',
    currency: CURRENCIES[0],
    language: LANGUAGES[0],
    invoiceNumber: '',
    invoiceType: 'F1',
    issueDate: getTodayISO(),
    dueDate: '',
    customFields: [],
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    fromPhone: '',
    fromTaxId: '',
    logoUrl: '',
    billToName: '',
    billToEmail: '',
    billToAddress: '',
    billToPhone: '',
    billToTaxId: '',
    showShipping: false,
    shipToName: '',
    shipToAddress: '',
    items: [
      {
        id: uid(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        vatLineId: defaultVatLine.id,
      },
    ],
    vatLines: [{ ...defaultVatLine }],
    discountRate: 0,
    taxRate: 0,
    shippingAmount: 0,
    amountPaid: 0,
    bankFields: [],
    notes: '',
    terms: '',
    signatureUrl: '',
    signatureLabel: '',
    signatures: [],
  }
}

export function getSubtotal(state: InvoiceState): number {
  if (!state?.items) return 0
  return state.items.reduce((sum, item) => sum + item.amount, 0)
}

export function getDiscountAmount(state: InvoiceState): number {
  return getSubtotal(state) * ((state?.discountRate || 0) / 100)
}

/**
 * Returns VAT breakdown grouped by rate.
 * If vatLines exist, groups items by their vatLineId.
 * Falls back to legacy single taxRate if no vatLines.
 */
export function getVatBreakdown(state: InvoiceState): VatBreakdownLine[] {
  if (!state?.items) return []
  const subtotal = getSubtotal(state)
  const discountRate = (state.discountRate || 0) / 100

  // If vatLines exist, compute per-line breakdown
  if (state.vatLines && state.vatLines.length > 0) {
    const lineMap = new Map<string, { rate: number; totalAmount: number }>()
    for (const vl of state.vatLines) {
      lineMap.set(vl.id, { rate: vl.rate, totalAmount: 0 })
    }

    for (const item of state.items) {
      const vlId = item.vatLineId || state.vatLines[0].id
      const entry = lineMap.get(vlId)
      if (entry) {
        entry.totalAmount += item.amount
      }
    }

    const result: VatBreakdownLine[] = []
    for (const [, entry] of lineMap) {
      if (entry.totalAmount === 0) continue
      const base = entry.totalAmount * (1 - discountRate)
      const quota = base * (entry.rate / 100)
      result.push({ rate: entry.rate, base: Math.round(base * 100) / 100, quota: Math.round(quota * 100) / 100 })
    }
    return result
  }

  // Legacy fallback: single taxRate
  if (state.taxRate > 0) {
    const base = subtotal * (1 - discountRate)
    const quota = base * (state.taxRate / 100)
    return [{ rate: state.taxRate, base: Math.round(base * 100) / 100, quota: Math.round(quota * 100) / 100 }]
  }

  return []
}

export function getTaxAmount(state: InvoiceState): number {
  const breakdown = getVatBreakdown(state)
  return breakdown.reduce((sum, line) => sum + line.quota, 0)
}

export function getTotal(state: InvoiceState): number {
  const subtotal = getSubtotal(state)
  const discount = getDiscountAmount(state)
  const tax = getTaxAmount(state)
  return subtotal - discount + tax + state.shippingAmount
}

export function getBalanceDue(state: InvoiceState): number {
  return getTotal(state) - state.amountPaid
}
