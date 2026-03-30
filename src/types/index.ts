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
  // Items
  items: InvoiceItem[]
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
