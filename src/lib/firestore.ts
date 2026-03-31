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
import type { Invoice, CompanyProfile, Template, Client } from '@/types'

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
  // Firestore rejects undefined values — strip them
  const clean: Record<string, unknown> = { updatedAt: serverTimestamp() }
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) clean[k] = v
  }
  await updateDoc(doc(getFirebaseDb(), 'invoices', id), clean)
}

export async function deleteInvoice(id: string) {
  await deleteDoc(doc(getFirebaseDb(), 'invoices', id))
}

export interface NumberingConfig {
  invoicePrefix: string
  quotePrefix: string
  includeYear: boolean
  separator: string
  resetYearly: boolean
}

const DEFAULT_NUMBERING: NumberingConfig = {
  invoicePrefix: 'FAC',
  quotePrefix: 'PRES',
  includeYear: true,
  separator: '-',
  resetYearly: true,
}

async function getUserNumberingConfig(userId: string): Promise<NumberingConfig> {
  try {
    const userDoc = await getDoc(doc(getFirebaseDb(), 'users', userId))
    if (userDoc.exists() && userDoc.data().numberingConfig) {
      return { ...DEFAULT_NUMBERING, ...userDoc.data().numberingConfig }
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_NUMBERING
}

export async function getNextInvoiceNumber(userId: string, docType?: 'invoice' | 'quote'): Promise<string> {
  const config = await getUserNumberingConfig(userId)
  const prefix = docType === 'quote' ? config.quotePrefix : config.invoicePrefix
  const sep = config.separator
  const currentYear = new Date().getFullYear()

  // Query latest invoices to find the last number with this prefix
  const q = query(
    collection(getFirebaseDb(), 'invoices'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)

  let nextNum = 1

  if (!snap.empty) {
    for (const d of snap.docs) {
      const inv = d.data() as Invoice
      const num = inv.invoiceNumber || ''
      if (!num.startsWith(prefix)) continue

      const match = num.match(/(\d+)$/)
      if (!match) continue

      const lastNum = parseInt(match[1], 10)

      // If resetYearly, check if the invoice is from the current year
      if (config.resetYearly && config.includeYear) {
        const yearStr = String(currentYear)
        if (!num.includes(yearStr)) {
          // Last invoice is from a previous year, reset to 1
          nextNum = 1
          break
        }
      }

      nextNum = lastNum + 1
      break
    }
  }

  const parts = [prefix]
  if (config.includeYear) parts.push(String(currentYear))
  parts.push(nextNum.toString().padStart(3, '0'))

  return parts.join(sep)
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

// ── Clients ──

export async function getClients(userId: string) {
  const q = query(
    collection(getFirebaseDb(), 'clients'),
    where('userId', '==', userId),
    orderBy('name', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Client)
}

export async function getClient(id: string) {
  const snap = await getDoc(doc(getFirebaseDb(), 'clients', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Client
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = doc(collection(getFirebaseDb(), 'clients'))
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateClient(id: string, data: Partial<Client>) {
  await updateDoc(doc(getFirebaseDb(), 'clients', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteClient(id: string) {
  await deleteDoc(doc(getFirebaseDb(), 'clients', id))
}
