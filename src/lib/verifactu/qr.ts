/**
 * VeriFactu QR code generation.
 *
 * Each emitted invoice must include a QR code that links to the AEAT
 * verification page, allowing the recipient to verify the invoice.
 */

const AEAT_QR_BASE_STAGING = 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR'
const AEAT_QR_BASE_PRODUCTION = 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'

/**
 * Builds the verification URL for the QR code.
 */
export function buildVerifactuQrUrl(params: {
  nif: string
  numSerie: string
  fecha: string // ISO date YYYY-MM-DD
  importe: number
}): string {
  const base = process.env.VERIFACTU_ENV === 'production' ? AEAT_QR_BASE_PRODUCTION : AEAT_QR_BASE_STAGING

  // Convert date to DD-MM-YYYY
  const [year, month, day] = params.fecha.split('-')
  const fechaFormatted = `${day}-${month}-${year}`

  const searchParams = new URLSearchParams({
    nif: params.nif,
    numserie: params.numSerie,
    fecha: fechaFormatted,
    importe: params.importe.toFixed(2),
  })

  return `${base}?${searchParams.toString()}`
}

/**
 * Generates a QR code as a data URL (base64 PNG).
 * Uses dynamic import to avoid SSR issues with the qrcode library.
 */
export async function generateQrDataUrl(text: string, size = 150): Promise<string> {
  try {
    const QRCode = await import('qrcode')
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
  } catch {
    // Fallback: return empty string if qrcode not installed yet
    console.warn('[VeriFactu QR] qrcode library not available, skipping QR generation')
    return ''
  }
}
