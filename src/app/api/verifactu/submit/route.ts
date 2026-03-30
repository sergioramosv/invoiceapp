import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/firebase-admin'
import { processInvoiceForVerifactu } from '@/lib/verifactu'
import type { Invoice } from '@/types'

const AEAT_STAGING_ENDPOINT = 'https://prewww1.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { invoiceId } = await request.json()

    // Get invoice from Firestore
    const db = getAdminDb()
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get()
    if (!invoiceDoc.exists) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice

    // Get previous invoice hash for chain
    const previousInvoices = await db.collection('invoices')
      .where('userId', '==', invoice.userId)
      .where('verifactuHash', '!=', null)
      .orderBy('verifactuHash')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    let previousHash = ''
    let previousInvoiceRef = null
    if (!previousInvoices.empty) {
      const prev = previousInvoices.docs[0].data() as Invoice
      previousHash = prev.verifactuHash || ''
      previousInvoiceRef = {
        nif: prev.fromTaxId || '',
        number: prev.invoiceNumber || '',
        date: formatDateForAEAT(prev.issueDate || ''),
      }
    }

    // Process invoice for VeriFactu
    const result = await processInvoiceForVerifactu(invoice, previousHash, previousInvoiceRef)

    // Try to send to AEAT staging (will likely fail without proper certificate, but we store the data)
    let aeatResponse = null
    let verifactuStatus: 'pending' | 'sent' | 'accepted' | 'rejected' = 'pending'

    try {
      const response = await fetch(AEAT_STAGING_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'AltaFactuSistemaFacturacion',
        },
        body: result.xml,
      })
      aeatResponse = await response.text()
      verifactuStatus = response.ok ? 'sent' : 'rejected'
    } catch {
      // AEAT not reachable (expected without certificate), still save hash
      verifactuStatus = 'pending'
    }

    // Update invoice in Firestore
    await db.collection('invoices').doc(invoiceId).update({
      verifactuHash: result.hash,
      verifactuPreviousHash: previousHash,
      verifactuTimestamp: result.timestamp,
      verifactuQRData: result.qrData,
      verifactuStatus,
    })

    return NextResponse.json({
      success: true,
      hash: result.hash,
      qrData: result.qrData,
      status: verifactuStatus,
      aeatResponse: aeatResponse ? aeatResponse.substring(0, 500) : null,
    })
  } catch (error) {
    console.error('VeriFactu submission error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

function formatDateForAEAT(isoDate: string): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year}`
}
