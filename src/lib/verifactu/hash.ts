import type { VeriFactuInvoiceType } from '@/types'

/**
 * Computes the SHA-256 hash for VeriFactu chain.
 *
 * Input string: NIF_emisor|NumSerieFactura|FechaExpedicion|TipoFactura|CuotaTotal|ImporteTotal|Huella_anterior
 * - FechaExpedicion in DD-MM-YYYY format
 * - CuotaTotal and ImporteTotal with 2 decimals, period as separator
 * - Huella_anterior empty string for the first invoice in the chain
 */
export async function computeVeriFactuHash(params: {
  nifEmisor: string
  numSerieFactura: string
  fechaExpedicion: string // ISO date YYYY-MM-DD, will be converted to DD-MM-YYYY
  tipoFactura: VeriFactuInvoiceType
  cuotaTotal: number
  importeTotal: number
  huellaAnterior: string
}): Promise<string> {
  // Convert ISO date to AEAT format DD-MM-YYYY
  const [year, month, day] = params.fechaExpedicion.split('-')
  const fechaAEAT = `${day}-${month}-${year}`

  const input = [
    params.nifEmisor,
    params.numSerieFactura,
    fechaAEAT,
    params.tipoFactura,
    params.cuotaTotal.toFixed(2),
    params.importeTotal.toFixed(2),
    params.huellaAnterior,
  ].join('|')

  // Use Web Crypto API (works in both Node.js and Edge runtime)
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Converts an ISO date (YYYY-MM-DD) to AEAT format (DD-MM-YYYY)
 */
export function toAEATDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}
