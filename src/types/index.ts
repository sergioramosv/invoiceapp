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

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  sortOrder: number
}

export interface TaxBreakdownItem {
  taxRate: number           // Tipo impositivo (21, 10, 4, 0)
  taxBase: number           // Base imponible
  taxAmount: number         // Cuota repercutida
  taxRegime?: string        // Clave régimen (01 = general)
  operationType?: string    // S1, S2, E1, etc.
}

export type DocumentType = 'invoice' | 'quote'

export interface Invoice {
  id: string
  userId: string
  templateStyle?: string
  documentType?: DocumentType
  title?: string
  invoiceNumber: string
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
  invoiceSeries?: string        // Serie de factura (ej: "FAC-2026")
  invoiceType?: string          // F1, F2, R1, R2, etc.
  verifactuStatus?: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected'
  verifactuHash?: string        // SHA-256 hash
  verifactuPreviousHash?: string // Hash de la factura anterior
  verifactuTimestamp?: string   // ISO timestamp of record generation
  verifactuQRData?: string      // QR code data string
  taxBreakdown?: TaxBreakdownItem[] // Desglose IVA
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
