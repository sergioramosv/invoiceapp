/**
 * VeriFactu Hash Service
 * Generates SHA-256 hash chain for invoice records
 */

export interface HashInput {
  nif: string              // NIF emisor
  invoiceNumber: string    // NumSerieFactura
  issueDate: string        // FechaExpedicion (DD-MM-YYYY)
  invoiceType: string      // TipoFactura (F1, F2, etc.)
  taxTotal: number         // CuotaTotal (sum of all tax amounts)
  totalAmount: number      // ImporteTotal
  previousHash: string     // Hash de factura anterior (empty for first)
}

export async function generateVerifactuHash(input: HashInput): Promise<string> {
  const concatenated = [
    input.nif,
    input.invoiceNumber,
    input.issueDate,
    input.invoiceType,
    input.taxTotal.toFixed(2),
    input.totalAmount.toFixed(2),
    input.previousHash,
  ].join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(concatenated)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
