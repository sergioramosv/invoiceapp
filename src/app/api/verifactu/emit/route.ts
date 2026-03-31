import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminDb } from '@/lib/firebase-admin'
import { computeVeriFactuHash } from '@/lib/verifactu/hash'
import { buildAltaFacturaXml } from '@/lib/verifactu/soap'
import { submitToAEAT } from '@/lib/verifactu/client'
import { buildVerifactuQrUrl } from '@/lib/verifactu/qr'
import type { Invoice } from '@/types'

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId } = await request.json()
  if (!invoiceId) {
    return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })
  }

  const db = getAdminDb()

  try {
    // === PHASE 1: LOCK AND PREPARE ===
    const prepareResult = await db.runTransaction(async (transaction) => {
      const invoiceRef = db.collection('invoices').doc(invoiceId)
      const invoiceSnap = await transaction.get(invoiceRef)

      if (!invoiceSnap.exists) {
        throw new Error('Invoice not found')
      }

      const invoice = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice

      if (invoice.emittedAt) throw new Error('Invoice already emitted')
      if (invoice.verifactuStatus === 'emitting') throw new Error('Invoice is currently being emitted (processing)')
      if (invoice.documentType === 'quote') throw new Error('Quotes cannot be emitted to VeriFactu')
      if (!invoice.fromTaxId) throw new Error('Sender NIF/CIF is required for VeriFactu')
      if (!invoice.invoiceNumber) throw new Error('Invoice number is required')
      if (!invoice.items || invoice.items.length === 0) throw new Error('Invoice must have at least one item')

      const nifEmisor = (invoice.fromTaxId || '').replace(/[\s\-\.]/g, '').toUpperCase()
      const prevQuery = await db.collection('invoices')
        .where('userId', '==', invoice.userId)
        .where('fromTaxId', '==', invoice.fromTaxId)
        .where('emittedAt', '!=', null)
        .orderBy('emittedAt', 'desc')
        .limit(1)
        .get()

      let previousHash = ''
      let previousInvoice: { nif: string; numSerie: string; fecha: string } | undefined

      if (!prevQuery.empty) {
        const prevDoc = prevQuery.docs[0].data() as Invoice
        previousHash = prevDoc.verifactuHash || ''
        if (previousHash) {
          const [y, m, d] = (prevDoc.issueDate || '').split('-')
          previousInvoice = {
            nif: nifEmisor,
            numSerie: prevDoc.invoiceNumber,
            fecha: `${d}-${m}-${y}`,
          }
        }
      }

      if (!invoice.vatBreakdown || invoice.vatBreakdown.length === 0) {
        const tr = invoice.taxRate || 0
        const ta = invoice.taxAmount || 0
        if (tr > 0 && ta > 0) {
          const base = Math.round((invoice.subtotal * (1 - (invoice.discountRate || 0) / 100)) * 100) / 100
          invoice.vatBreakdown = [{ rate: tr, base, quota: Math.round(ta * 100) / 100 }]
        }
      }

      const taxAmount = invoice.taxAmount || 0
      const total = invoice.total || 0
      const hash = await computeVeriFactuHash({
        nifEmisor: invoice.fromTaxId,
        numSerieFactura: invoice.invoiceNumber,
        fechaExpedicion: invoice.issueDate,
        tipoFactura: invoice.invoiceType || 'F1',
        cuotaTotal: taxAmount,
        importeTotal: total,
        huellaAnterior: previousHash,
      })

      const soapXml = buildAltaFacturaXml(invoice, hash, previousHash, previousInvoice)

      transaction.update(invoiceRef, { 
        verifactuStatus: 'emitting',
        updatedAt: new Date().toISOString()
      })

      return { invoice, hash, previousHash, soapXml, total, taxAmount }
    })

    const { invoice, hash, previousHash, soapXml, total } = prepareResult

    // === PHASE 2: EXTERNAL CALL ===
    const aeatResponse = await submitToAEAT(soapXml)

    const qrUrl = buildVerifactuQrUrl({
      nif: invoice.fromTaxId!,
      numSerie: invoice.invoiceNumber!,
      fecha: invoice.issueDate!,
      importe: total,
    })

    // === PHASE 3: WRITE FINAL RESULT ===
    const now = new Date().toISOString()
    const invoiceRef = db.collection('invoices').doc(invoiceId)

    if (aeatResponse.estado === 'Correcto' || aeatResponse.estado === 'AceptadoConErrores') {
      await invoiceRef.update({
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

      return NextResponse.json({
        success: true,
        hash,
        csv: aeatResponse.csv,
        qrUrl,
        estado: aeatResponse.estado,
      })
    } else {
      await invoiceRef.update({
        verifactuStatus: 'rejected',
        aeatResponseCode: aeatResponse.errorCode || '',
        aeatResponseMessage: aeatResponse.errorMessage || 'Unknown error',
        updatedAt: now,
      })

      return NextResponse.json({
        success: false,
        error: aeatResponse.errorMessage || 'AEAT rejected the invoice',
        errorCode: aeatResponse.errorCode,
      })
    }

  } catch (error) {
    // Also revert lock if we threw before the update
    const message = error instanceof Error ? error.message : 'Emission failed'
    
    // Attempt to revert the 'emitting' state if we failed during the transaction or network call.
    // We ignore the error of this rollback.
    try {
      const db = getAdminDb()
      const invoiceRef = db.collection('invoices').doc(invoiceId)
      const snap = await invoiceRef.get()
      if (snap.exists && snap.data()?.verifactuStatus === 'emitting') {
        await invoiceRef.update({
          verifactuStatus: 'rejected',
          aeatResponseCode: 'SYSTEM_ERROR',
          aeatResponseMessage: message,
          updatedAt: new Date().toISOString()
        })
      }
    } catch (_) {}

    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
