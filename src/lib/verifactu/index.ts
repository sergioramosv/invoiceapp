import { generateVerifactuHash } from './hash'
import { buildVerifactuXML } from './xml-builder'
import { generateVerifactuQRData } from './qr'
import { SOFTWARE_INFO } from './constants'
import type { Invoice, TaxBreakdownItem } from '@/types'

export interface VerifactuResult {
  hash: string
  xml: string
  qrData: string
  timestamp: string
}

/**
 * Convert ISO date (YYYY-MM-DD) to VeriFactu format (DD-MM-YYYY)
 */
function toVerifactuDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}

export async function processInvoiceForVerifactu(
  invoice: Invoice,
  previousHash: string,
  previousInvoice?: { nif: string; number: string; date: string } | null
): Promise<VerifactuResult> {
  const taxBreakdown = calculateTaxBreakdown(invoice)
  const taxTotal = taxBreakdown.reduce((sum, item) => sum + item.taxAmount, 0)
  const issueDate = toVerifactuDate(invoice.issueDate)

  const hash = await generateVerifactuHash({
    nif: invoice.fromTaxId || '',
    invoiceNumber: invoice.invoiceNumber,
    issueDate,
    invoiceType: invoice.invoiceType || 'F1',
    taxTotal,
    totalAmount: invoice.total,
    previousHash,
  })

  const now = new Date()
  const timestamp = toVerifactuDate(now.toISOString().split('T')[0])
  const time = now.toTimeString().split(' ')[0] // HH:MM:SS
  const timezone = now.getTimezoneOffset() <= -60 ? '02' : '01' // CET=01, CEST=02

  const description = invoice.items
    .map(item => item.description)
    .filter(Boolean)
    .join(', ')
    .slice(0, 500) || 'Servicios profesionales'

  const xml = buildVerifactuXML({
    softwareName: SOFTWARE_INFO.name,
    softwareNIF: SOFTWARE_INFO.nif,
    softwareId: SOFTWARE_INFO.softwareId,
    softwareVersion: SOFTWARE_INFO.version,
    issuerNIF: invoice.fromTaxId || '',
    issuerName: invoice.fromName || '',
    invoiceNumber: invoice.invoiceNumber,
    issueDate,
    invoiceType: invoice.invoiceType || 'F1',
    description,
    recipientNIF: invoice.billToTaxId || '',
    recipientName: invoice.billToName || '',
    taxBreakdown,
    totalAmount: invoice.total,
    previousInvoiceNIF: previousInvoice?.nif,
    previousInvoiceNumber: previousInvoice?.number,
    previousInvoiceDate: previousInvoice?.date,
    previousHash: previousHash || undefined,
    hash,
    timestamp,
    time,
    timezone,
  })

  const qrData = generateVerifactuQRData({
    nif: invoice.fromTaxId || '',
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.total,
    issueDate,
  })

  return {
    hash,
    xml,
    qrData,
    timestamp: now.toISOString(),
  }
}

/**
 * Calculate tax breakdown from invoice data
 */
export function calculateTaxBreakdown(invoice: Invoice): TaxBreakdownItem[] {
  const taxRate = invoice.taxRate || 0
  const subtotal = invoice.subtotal || 0
  const discountAmount = invoice.discountAmount || 0
  const taxBase = subtotal - discountAmount
  const taxAmount = taxBase * (taxRate / 100)

  if (taxRate === 0) return []

  return [{
    taxRate,
    taxBase: Math.round(taxBase * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    taxRegime: '01',
    operationType: 'S1',
  }]
}
