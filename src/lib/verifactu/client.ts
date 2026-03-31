/**
 * AEAT VeriFactu SOAP client.
 *
 * Modes:
 * - STUB (default): simulates success, no certificate needed
 * - LIVE (VERIFACTU_LIVE=true): sends to AEAT STAGING with .p12 certificate
 *
 * IMPORTANT: Production URL is intentionally NOT used.
 * This client ONLY connects to the AEAT staging/test environment.
 */

import https from 'https'
import fs from 'fs'
import path from 'path'

export interface AEATResponse {
  estado: 'Correcto' | 'AceptadoConErrores' | 'Incorrecto'
  csv?: string
  errorCode?: string
  errorMessage?: string
}

// URL loaded from .env — defaults to STAGING if not set
const DEFAULT_STAGING_URL = 'https://prewww10.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP'

/**
 * Submits a SOAP XML envelope to the AEAT VeriFactu web service.
 *
 * STUB MODE (default): Returns simulated success.
 * LIVE MODE (VERIFACTU_LIVE=true): Sends to AEAT STAGING with mutual TLS (.p12 certificate).
 */
export async function submitToAEAT(soapXml: string): Promise<AEATResponse> {
  const isLive = process.env.VERIFACTU_LIVE === 'true'

  if (!isLive) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[VeriFactu STUB] Simulating AEAT submission (set VERIFACTU_LIVE=true for real)')
    return {
      estado: 'Correcto',
      csv: `CSV-STUB-${Date.now()}`,
    }
  }

  // ── LIVE MODE — STAGING ONLY ──

  const certPath = process.env.VERIFACTU_CERT_PATH
  const certPassword = process.env.VERIFACTU_CERT_PASSWORD

  if (!certPath || !certPassword) {
    console.error('[VeriFactu] VERIFACTU_CERT_PATH and VERIFACTU_CERT_PASSWORD are required for live mode')
    return {
      estado: 'Incorrecto',
      errorCode: 'CONFIG',
      errorMessage: 'Certificado .p12 no configurado. Añade VERIFACTU_CERT_PATH y VERIFACTU_CERT_PASSWORD en .env',
    }
  }

  // Load the .p12 certificate
  const absolutePath = path.resolve(certPath)
  if (!fs.existsSync(absolutePath)) {
    return {
      estado: 'Incorrecto',
      errorCode: 'CERT_NOT_FOUND',
      errorMessage: `Certificado no encontrado: ${absolutePath}`,
    }
  }

  const pfx = fs.readFileSync(absolutePath)

  const aeatUrl = process.env.VERIFACTU_URL || DEFAULT_STAGING_URL

  console.log('[VeriFactu LIVE] Sending to:', aeatUrl)
  console.log('[VeriFactu LIVE] Certificate:', absolutePath)
  console.log('[VeriFactu LIVE] XML length:', soapXml.length)
  console.log('[VeriFactu LIVE] XML:\n', soapXml)

  return new Promise<AEATResponse>((resolve) => {
    const url = new URL(aeatUrl)

    const agent = new https.Agent({
      pfx,
      passphrase: certPassword,
      rejectUnauthorized: true, // verify AEAT's SSL cert
    })

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      agent,
      timeout: 15000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Content-Length': Buffer.byteLength(soapXml, 'utf-8'),
      },
    }

    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => {
        console.log('[VeriFactu LIVE] Response status:', res.statusCode)
        console.log('[VeriFactu LIVE] Response body (full):\n', body)

        // Check for SOAP Fault first (e.g. error 1100, 4102, etc.)
        const faultStringMatch = body.match(/<(?:\w+:)?faultstring>([^<]+)</)
        if (faultStringMatch) {
          const faultMsg = faultStringMatch[1]
          const faultCodeMatch = faultMsg.match(/Codigo\[(\d+)\]/)
          console.error('[VeriFactu LIVE] SOAP Fault:', faultMsg)
          resolve({
            estado: 'Incorrecto',
            errorCode: faultCodeMatch?.[1] || 'SOAP_FAULT',
            errorMessage: faultMsg,
          })
          return
        }

        // Parse VeriFactu-level response
        const estadoMatch = body.match(/<(?:\w+:)?EstadoRegistro>([^<]+)</)
        const csvMatch = body.match(/<(?:\w+:)?CSV>([^<]+)</)
        const errorCodeMatch = body.match(/<(?:\w+:)?CodigoErrorRegistro>([^<]+)</)
        const errorMsgMatch = body.match(/<(?:\w+:)?DescripcionErrorRegistro>([^<]+)</)

        const estado = estadoMatch?.[1] || ''

        if (estado === 'Correcto' || estado === 'AceptadoConErrores') {
          resolve({
            estado: estado as AEATResponse['estado'],
            csv: csvMatch?.[1] || '',
          })
        } else {
          resolve({
            estado: 'Incorrecto',
            errorCode: errorCodeMatch?.[1] || `HTTP-${res.statusCode}`,
            errorMessage: errorMsgMatch?.[1] || body,
          })
        }
      })
    })

    req.on('error', (err) => {
      console.error('[VeriFactu LIVE] Request error:', err.message)
      resolve({
        estado: 'Incorrecto',
        errorCode: 'NETWORK',
        errorMessage: err.message,
      })
    })

    req.on('timeout', () => {
      console.error('[VeriFactu LIVE] Request timeout')
      req.destroy()
      resolve({
        estado: 'Incorrecto',
        errorCode: 'TIMEOUT',
        errorMessage: 'Tiempo de espera agotado (Timeout) al conectar con AEAT',
      })
    })

    req.write(soapXml)
    req.end()
  })
}
