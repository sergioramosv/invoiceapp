import type { Invoice } from '@/types'

export function exportToCSV(invoices: Invoice[], filename: string = 'invoices') {
  const headers = [
    'Tipo', 'Numero', 'Fecha', 'Cliente', 'NIF Cliente',
    'Subtotal', 'IVA %', 'IVA', 'Descuento %', 'Descuento',
    'Total', 'Estado', 'Moneda'
  ]

  const rows = invoices.map(inv => [
    inv.documentType === 'quote' ? 'Presupuesto' : 'Factura',
    inv.invoiceNumber || '',
    inv.issueDate || '',
    inv.billToName || '',
    inv.billToTaxId || '',
    (inv.subtotal || 0).toFixed(2),
    (inv.taxRate || 0).toFixed(2),
    (inv.taxAmount || 0).toFixed(2),
    (inv.discountRate || 0).toFixed(2),
    (inv.discountAmount || 0).toFixed(2),
    (inv.total || 0).toFixed(2),
    inv.status || 'draft',
    inv.currency || 'EUR',
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n')

  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
