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

export async function GET(request: Request) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const db = getAdminDb()
  const clients = await db.collection('clients')
    .where('userId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()

  const data = clients.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json({ clients: data })
}

export async function POST(request: Request) {
  const apiKey = getApiKey(request)
  if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 })

  const user = await getUserByApiKey(apiKey)
  if (!user) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })

  const body = await request.json()
  const db = getAdminDb()

  const clientData = {
    userId: user.id,
    name: body.name || '',
    email: body.email || '',
    address: body.address || '',
    phone: body.phone || '',
    taxId: body.taxId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const ref = await db.collection('clients').add(clientData)
  return NextResponse.json({ id: ref.id, ...clientData }, { status: 201 })
}
