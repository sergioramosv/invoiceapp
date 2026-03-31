'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { uid } from '@/lib/uid'
import type { Invoice, Client, InvoiceStatus } from '@/types'

/* ─── Seed Data ─── */

const DEMO_USER_ID = 'demo-user'

const today = new Date().toISOString().split('T')[0]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const SEED_CLIENTS: Client[] = [
  { id: 'c1', userId: DEMO_USER_ID, name: 'TechCorp S.L.', email: 'admin@techcorp.es', address: 'Av. Diagonal 123, Barcelona', phone: '+34 933 123 456', taxId: 'B12345678', createdAt: daysAgo(60), updatedAt: daysAgo(60) },
  { id: 'c2', userId: DEMO_USER_ID, name: 'Digital Studio', email: 'hola@digitalstudio.com', address: 'Calle Serrano 45, Madrid', phone: '+34 911 234 567', taxId: 'B87654321', createdAt: daysAgo(45), updatedAt: daysAgo(45) },
  { id: 'c3', userId: DEMO_USER_ID, name: 'Freelance Maria', email: 'maria@freelance.es', address: 'Calle Mayor 12, Valencia', phone: '+34 622 345 678', taxId: '12345678A', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  { id: 'c4', userId: DEMO_USER_ID, name: 'StartupX', email: 'info@startupx.io', address: 'Calle Innovacion 8, Malaga', phone: '+34 655 456 789', taxId: 'B55667788', createdAt: daysAgo(15), updatedAt: daysAgo(15) },
]

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv1', userId: DEMO_USER_ID, documentType: 'invoice', title: 'Factura',
    invoiceNumber: 'FAC-2026-001', status: 'paid' as InvoiceStatus, currency: 'EUR', language: 'es',
    issueDate: daysAgo(45), dueDate: daysAgo(15),
    fromName: 'ACME Studio', fromEmail: 'info@acme.es', fromAddress: 'Gran Via 42, Madrid', fromTaxId: 'B99887766',
    billToName: 'TechCorp S.L.', billToEmail: 'admin@techcorp.es', billToAddress: 'Av. Diagonal 123, Barcelona', billToTaxId: 'B12345678',
    items: [
      { id: 'i1', description: 'Desarrollo web', quantity: 1, unitPrice: 3200, amount: 3200, sortOrder: 0 },
      { id: 'i2', description: 'Diseno UX/UI', quantity: 1, unitPrice: 1800, amount: 1800, sortOrder: 1 },
    ],
    subtotal: 5000, taxRate: 21, taxAmount: 1050, discountRate: 0, discountAmount: 0,
    shippingAmount: 0, total: 6050, amountPaid: 6050, balanceDue: 0,
    createdAt: daysAgo(45), updatedAt: daysAgo(15),
  },
  {
    id: 'inv2', userId: DEMO_USER_ID, documentType: 'invoice', title: 'Factura',
    invoiceNumber: 'FAC-2026-002', status: 'sent' as InvoiceStatus, currency: 'EUR', language: 'es',
    issueDate: daysAgo(20), dueDate: daysAgo(-10),
    fromName: 'ACME Studio', fromEmail: 'info@acme.es', fromAddress: 'Gran Via 42, Madrid', fromTaxId: 'B99887766',
    billToName: 'Digital Studio', billToEmail: 'hola@digitalstudio.com', billToAddress: 'Calle Serrano 45, Madrid', billToTaxId: 'B87654321',
    items: [
      { id: 'i3', description: 'Consultoria estrategica', quantity: 10, unitPrice: 120, amount: 1200, sortOrder: 0 },
      { id: 'i4', description: 'Informe de mercado', quantity: 1, unitPrice: 800, amount: 800, sortOrder: 1 },
    ],
    subtotal: 2000, taxRate: 21, taxAmount: 420, discountRate: 0, discountAmount: 0,
    shippingAmount: 0, total: 2420, amountPaid: 0, balanceDue: 2420,
    createdAt: daysAgo(20), updatedAt: daysAgo(20),
  },
  {
    id: 'inv3', userId: DEMO_USER_ID, documentType: 'invoice', title: 'Factura',
    invoiceNumber: 'FAC-2026-003', status: 'draft' as InvoiceStatus, currency: 'EUR', language: 'es',
    issueDate: daysAgo(5),
    fromName: 'ACME Studio', fromEmail: 'info@acme.es', fromAddress: 'Gran Via 42, Madrid', fromTaxId: 'B99887766',
    billToName: 'Freelance Maria', billToEmail: 'maria@freelance.es', billToAddress: 'Calle Mayor 12, Valencia', billToTaxId: '12345678A',
    items: [
      { id: 'i5', description: 'Landing page', quantity: 1, unitPrice: 950, amount: 950, sortOrder: 0 },
    ],
    subtotal: 950, taxRate: 21, taxAmount: 199.5, discountRate: 0, discountAmount: 0,
    shippingAmount: 0, total: 1149.5, amountPaid: 0, balanceDue: 1149.5,
    createdAt: daysAgo(5), updatedAt: daysAgo(5),
  },
  {
    id: 'inv4', userId: DEMO_USER_ID, documentType: 'invoice', title: 'Factura',
    invoiceNumber: 'FAC-2026-004', status: 'paid' as InvoiceStatus, currency: 'EUR', language: 'es',
    issueDate: daysAgo(60), dueDate: daysAgo(30),
    fromName: 'ACME Studio', fromEmail: 'info@acme.es', fromAddress: 'Gran Via 42, Madrid', fromTaxId: 'B99887766',
    billToName: 'StartupX', billToEmail: 'info@startupx.io', billToAddress: 'Calle Innovacion 8, Malaga', billToTaxId: 'B55667788',
    items: [
      { id: 'i6', description: 'App movil React Native', quantity: 1, unitPrice: 8500, amount: 8500, sortOrder: 0 },
      { id: 'i7', description: 'Backend API Node.js', quantity: 1, unitPrice: 4200, amount: 4200, sortOrder: 1 },
      { id: 'i8', description: 'Despliegue y configuracion', quantity: 1, unitPrice: 600, amount: 600, sortOrder: 2 },
    ],
    subtotal: 13300, taxRate: 21, taxAmount: 2793, discountRate: 0, discountAmount: 0,
    shippingAmount: 0, total: 16093, amountPaid: 16093, balanceDue: 0,
    createdAt: daysAgo(60), updatedAt: daysAgo(30),
  },
  {
    id: 'inv5', userId: DEMO_USER_ID, documentType: 'invoice', title: 'Factura',
    invoiceNumber: 'FAC-2026-005', status: 'overdue' as InvoiceStatus, currency: 'EUR', language: 'es',
    issueDate: daysAgo(40), dueDate: daysAgo(10),
    fromName: 'ACME Studio', fromEmail: 'info@acme.es', fromAddress: 'Gran Via 42, Madrid', fromTaxId: 'B99887766',
    billToName: 'TechCorp S.L.', billToEmail: 'admin@techcorp.es', billToAddress: 'Av. Diagonal 123, Barcelona', billToTaxId: 'B12345678',
    items: [
      { id: 'i9', description: 'Mantenimiento mensual', quantity: 2, unitPrice: 450, amount: 900, sortOrder: 0 },
    ],
    subtotal: 900, taxRate: 21, taxAmount: 189, discountRate: 0, discountAmount: 0,
    shippingAmount: 0, total: 1089, amountPaid: 0, balanceDue: 1089,
    createdAt: daysAgo(40), updatedAt: daysAgo(40),
  },
]

/* ─── Context ─── */

interface DemoContextType {
  invoices: Invoice[]
  clients: Client[]
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  getInvoice: (id: string) => Invoice | null
  addClient: (client: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => string
  updateClient: (id: string, data: Partial<Client>) => void
  getNextInvoiceNumber: () => string
}

const DemoContext = createContext<DemoContextType | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES)
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS)

  const addInvoice = useCallback((data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uid()
    const now = new Date().toISOString()
    const invoice: Invoice = { ...data, id, createdAt: now, updatedAt: now } as Invoice
    setInvoices(prev => [invoice, ...prev])
    return id
  }, [])

  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, ...data, updatedAt: new Date().toISOString() } : inv
    ))
  }, [])

  const getInvoice = useCallback((id: string) => {
    return invoices.find(inv => inv.id === id) || null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices])

  const addClient = useCallback((data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const id = uid()
    const now = new Date().toISOString()
    const client: Client = { ...data, id, userId: DEMO_USER_ID, createdAt: now, updatedAt: now }
    setClients(prev => [...prev, client])
    return id
  }, [])

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c =>
      c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  const getNextInvoiceNumber = useCallback(() => {
    const year = new Date().getFullYear()
    const nums = invoices
      .map(inv => {
        const match = inv.invoiceNumber?.match(/(\d+)$/)
        return match ? parseInt(match[1], 10) : 0
      })
    const next = Math.max(0, ...nums) + 1
    return `FAC-${year}-${next.toString().padStart(3, '0')}`
  }, [invoices])

  return (
    <DemoContext.Provider value={{ invoices, clients, addInvoice, updateInvoice, getInvoice, addClient, updateClient, getNextInvoiceNumber }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}

export { DEMO_USER_ID }
