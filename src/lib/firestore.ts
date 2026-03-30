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

export async function createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = doc(collection(getFirebaseDb(), 'templates'))
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function deleteTemplate(id: string) {
  await deleteDoc(doc(getFirebaseDb(), 'templates', id))
}
