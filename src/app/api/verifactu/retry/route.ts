import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/firebase-admin'
import { computeVeriFactuHash } from '@/lib/verifactu/hash'
import { buildAltaFacturaXml } from '@/lib/verifactu/soap'
import { submitToAEAT } from '@/lib/verifactu/client'
import { buildVerifactuQrUrl } from '@/lib/verifactu/qr'
import type { Invoice } from '@/types'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await request.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const db = getAdminDb()

  try {
    // Find all pending invoices for this user
    const pendingQuery = await db.collection('invoices')
      .where('userId', '==', userId)
      .where('verifactuStatus', '==', 'rejected')
      .limit(10)
      .get()

    if (pendingQuery.empty) {
      return NextResponse.json({ retried: 0, message: 'No pending invoices' })
    }

    const results: { invoiceId: string; success: boolean; error?: string }[] = []

    for (const doc of pendingQuery.docs) {
      const invoice = { id: doc.id, ...doc.data() } as Invoice

      try {
        // Get previous hash
        const prevQuery = await db.collection('invoices')
          .where('userId', '==', userId)
          .where('emittedAt', '!=', null)
          .orderBy('emittedAt', 'desc')
          .limit(1)
          .get()

        let previousHash = ''
        if (!prevQuery.empty) {
          previousHash = (prevQuery.docs[0].data() as Invoice).verifactuHash || ''
        }

        const hash = await computeVeriFactuHash({
          nifEmisor: invoice.fromTaxId || '',
          numSerieFactura: invoice.invoiceNumber,
          fechaExpedicion: invoice.issueDate,
          tipoFactura: invoice.invoiceType || 'F1',
          cuotaTotal: invoice.taxAmount || 0,
          importeTotal: invoice.total || 0,
          huellaAnterior: previousHash,
        })

        const soapXml = buildAltaFacturaXml(invoice, hash, previousHash)
        const aeatResponse = await submitToAEAT(soapXml)

        const now = new Date().toISOString()

        if (aeatResponse.estado === 'Correcto' || aeatResponse.estado === 'AceptadoConErrores') {
          const qrUrl = buildVerifactuQrUrl({
            nif: invoice.fromTaxId || '',
            numSerie: invoice.invoiceNumber,
            fecha: invoice.issueDate,
            importe: invoice.total || 0,
          })

          await doc.ref.update({
            status: 'emitted',
            verifactuStatus: 'accepted',
            verifactuHash: hash,
            verifactuPreviousHash: previousHash,
            verifactuQrUrl: qrUrl,
            emittedAt: now,
            aeatCsv: aeatResponse.csv || '',
            aeatResponseCode: '',
            aeatResponseMessage: '',
            updatedAt: now,
          })
          results.push({ invoiceId: doc.id, success: true })
        } else {
          const retryCount = ((invoice as unknown as Record<string, unknown>).retryCount as number || 0) + 1
          await doc.ref.update({
            verifactuStatus: 'rejected',
            aeatResponseCode: aeatResponse.errorCode || '',
            aeatResponseMessage: aeatResponse.errorMessage || '',
            retryCount,
            updatedAt: now,
          })
          results.push({ invoiceId: doc.id, success: false, error: aeatResponse.errorMessage })
        }
      } catch (err) {
        results.push({ invoiceId: doc.id, success: false, error: err instanceof Error ? err.message : 'Unknown' })
      }
    }

    return NextResponse.json({
      retried: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Retry failed' }, { status: 500 })
  }
}
