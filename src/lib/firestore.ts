import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import type { Invoice, CompanyProfile, Template } from '@/types'

// ── Invoices ──

export async function getInvoices(userId: string) {
  const q = query(
    collection(getFirebaseDb(), 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice)
}

export async function getInvoice(id: string) {
  const snap = await getDoc(doc(getFirebaseDb(), 'invoices', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Invoice
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = doc(collection(getFirebaseDb(), 'invoices'))
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  await updateDoc(doc(getFirebaseDb(), 'invoices', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteInvoice(id: string) {
  await deleteDoc(doc(getFirebaseDb(), 'invoices', id))
}

export async function getNextInvoiceNumber(userId: string): Promise<string> {
  const q = query(
    collection(getFirebaseDb(), 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return 'INV-001'

  const lastInvoice = snap.docs[0].data() as Invoice
  const lastNumber = lastInvoice.invoiceNumber || 'INV-000'
  const match = lastNumber.match(/(\d+)$/)
  if (!match) return 'INV-001'

  const next = parseInt(match[1], 10) + 1
  const prefix = lastNumber.replace(/\d+$/, '')
  return `${prefix}${next.toString().padStart(3, '0')}`
}

export async function convertQuoteToInvoice(quote: Invoice): Promise<string> {
  const nextNum = await getNextInvoiceNumber(quote.userId)
  const { id, createdAt, updatedAt, ...data } = quote
  void id; void createdAt; void updatedAt
  return createInvoice({
    ...data,
    documentType: 'invoice',
    title: 'Factura',
    invoiceNumber: nextNum,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
  })
}

export async function duplicateInvoice(
  invoice: Invoice
): Promise<string> {
  const nextNum = await getNextInvoiceNumber(invoice.userId)
  const { id, createdAt, updatedAt, ...data } = invoice
  void id; void createdAt; void updatedAt
  return createInvoice({
    ...data,
    invoiceNumber: nextNum,
    status: 'draft',
  })
}

// ── Company Profile ──

export async function getCompanyProfile(userId: string) {
  const snap = await getDoc(doc(getFirebaseDb(), 'companyProfiles', userId))
  if (!snap.exists()) return null
  return snap.data() as CompanyProfile
}

export async function saveCompanyProfile(userId: string, data: Omit<CompanyProfile, 'userId'>) {
  await setDoc(doc(getFirebaseDb(), 'companyProfiles', userId), { ...data, userId }, { merge: true })
}

// ── Templates ──

export async function getTemplates(userId: string) {
  const q = query(collection(getFirebaseDb(), 'templates'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Template)
}

export async function getTemplate(id: string) {
  const snap = await getDoc(doc(getFirebaseDb(), 'templates', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Template
}

export async function createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = doc(collection(getFirebaseDb(), 'templates'))
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function deleteTemplate(id: string) {
  await deleteDoc(doc(getFirebaseDb(), 'templates', id))
}
