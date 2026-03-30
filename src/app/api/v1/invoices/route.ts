import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

// Simple API key auth via header
function getApiKey(request: Request): string | null {
  return request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '') || null
}

async function getUserByApiKey(apiKey: string) {
  const db = getAdminDb()
  const users = await db.collection('users').where('apiKey', '==', apiKey).limit(1).get()
  if (users.empty) return null
  return { id: users.docs[0].id, ...users.docs[0].data() }
}

export async function GET(request: Request) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const db = getAdminDb()
  const invoices = await db.collection('invoices')
    .where('userId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  const data = invoices.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json({ invoices: data })
}

export async function POST(request: Request) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const body = await request.json()
  const db = getAdminDb()

  const invoiceData = {
    userId: user.id,
    documentType: body.documentType || 'invoice',
    title: body.title || 'Factura',
    invoiceNumber: body.invoiceNumber || '',
    status: 'draft',
    currency: body.currency || 'EUR',
    language: body.language || 'es',
    issueDate: body.issueDate || new Date().toISOString().split('T')[0],
    dueDate: body.dueDate || '',
    fromName: body.fromName || '',
    fromEmail: body.fromEmail || '',
    fromAddress: body.fromAddress || '',
    fromTaxId: body.fromTaxId || '',
    billToName: body.billToName || '',
    billToEmail: body.billToEmail || '',
    billToAddress: body.billToAddress || '',
    billToTaxId: body.billToTaxId || '',
    subtotal: body.subtotal || 0,
    taxRate: body.taxRate || 0,
    taxAmount: body.taxAmount || 0,
    discountRate: body.discountRate || 0,
    discountAmount: body.discountAmount || 0,
    total: body.total || 0,
    items: body.items || [],
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const ref = await db.collection('invoices').add(invoiceData)
  return NextResponse.json({ id: ref.id, ...invoiceData }, { status: 201 })
}
