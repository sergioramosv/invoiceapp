export interface User {
  uid: string
  email: string
  name: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyProfile {
  userId: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  taxId?: string
  logoUrl?: string
  website?: string
}

export type InvoiceStatus = 'draft' | 'emitted' | 'sent' | 'paid' | 'overdue' | 'cancelled'

// VeriFactu types
export type VeriFactuInvoiceType = 'F1' | 'F2' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'
export type VeriFactuStatus = 'none' | 'pending' | 'emitting' | 'sent' | 'accepted' | 'rejected'

export interface VatBreakdownLine {
  rate: number
  base: number
  quota: number
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  sortOrder: number
  vatLineId?: string
}

export type DocumentType = 'invoice' | 'quote'

export interface Invoice {
  id: string
  userId: string
  templateStyle?: string
  documentType?: DocumentType
  title?: string
  invoiceNumber: string
  invoiceSeries?: string
  invoiceSequentialNumber?: number
  invoiceType?: VeriFactuInvoiceType
  status: InvoiceStatus
  currency: string
  language: string
  issueDate: string
  dueDate?: string
  // From (sender)
  fromName?: string
  fromEmail?: string
  fromAddress?: string
  fromPhone?: string
  fromTaxId?: string
  fromLogoUrl?: string
  // Bill to (client)
  billToName?: string
  billToEmail?: string
  billToAddress?: string
  billToPhone?: string
  billToTaxId?: string
  // Shipping to
  shipToName?: string
  shipToAddress?: string
  // Financial
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  shippingAmount: number
  total: number
  amountPaid: number
  balanceDue: number
  // VAT breakdown (VeriFactu)
  vatBreakdown?: VatBreakdownLine[]
  // Bank info
  bankName?: string
  bankAccount?: string
  bankRouting?: string
  bankSwift?: string
  // Notes
  notes?: string
  terms?: string
  // Signature
  signatureUrl?: string
  signatureLabel?: string
  // Items
  items: InvoiceItem[]
  // VeriFactu
  verifactuHash?: string
  verifactuPreviousHash?: string
  verifactuStatus?: VeriFactuStatus
  verifactuQrUrl?: string
  emittedAt?: string
  aeatResponseCode?: string
  aeatResponseMessage?: string
  aeatCsv?: string
  // Rectificativa
  rectifiedInvoiceId?: string
  rectifiedInvoiceNumber?: string
  rectificationReason?: string
  // Metadata
  templateId?: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  userId: string
  name: string
  data: Record<string, unknown>
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  userId: string
  name: string
  email?: string
  address?: string
  phone?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}
