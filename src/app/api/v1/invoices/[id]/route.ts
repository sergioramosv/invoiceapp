import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

function getApiKey(request: Request): string | null {
  return request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '') || null
}

async function getUserByApiKey(apiKey: string) {
  const db = getAdminDb()
  const users = await db.collection('users').where('apiKey', '==', apiKey).limit(1).get()
  if (users.empty) return null
  return { id: users.docs[0].id, ...users.docs[0].data() }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const { id } = await params
  const db = getAdminDb()
  const doc = await db.collection('invoices').doc(id).get()

  if (!doc.exists) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const data = doc.data()
  if (data?.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ id: doc.id, ...data })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const { id } = await params
  const db = getAdminDb()
  const docRef = db.collection('invoices').doc(id)
  const doc = await docRef.get()

  if (!doc.exists) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const existing = doc.data()
  if (existing?.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const updateData = {
    ...body,
    updatedAt: new Date().toISOString(),
  }
  // Don't allow changing userId
  delete updateData.userId
  delete updateData.id

  await docRef.update(updateData)
  const updated = await docRef.get()
  return NextResponse.json({ id: updated.id, ...updated.data() })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const { id } = await params
  const db = getAdminDb()
  const docRef = db.collection('invoices').doc(id)
  const doc = await docRef.get()

  if (!doc.exists) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const data = doc.data()
  if (data?.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await docRef.delete()
  return NextResponse.json({ success: true })
}
