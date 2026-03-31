import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

/* ─── SVG Logo generators (inline data URIs) ─── */

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const LOGOS = {
  acme: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#4f46e5"/><text x="100" y="125" text-anchor="middle" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="white">A</text></svg>`),
  nova: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#0ea5e9"/><text x="100" y="125" text-anchor="middle" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="white">N</text></svg>`),
  pixel: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#f97316"/><text x="100" y="125" text-anchor="middle" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="white">P</text></svg>`),
}

const SIGNATURES = {
  sig1: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="M20 70 Q40 20 60 65 Q80 30 100 60 Q120 25 140 55 Q160 35 180 50 L200 45 Q220 55 240 40 Q260 50 280 35" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/></svg>`),
  sig2: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="M15 60 Q30 15 50 55 Q65 25 85 50 Q100 30 120 55 Q135 20 160 45 L180 40 Q200 60 230 30 L260 50" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>`),
  sig3: svgToDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="M25 55 Q50 10 70 50 Q90 70 110 40 Q130 15 150 50 Q170 70 190 35 Q210 15 230 50 L260 45" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/></svg>`),
}

/* ─── Demo data ─── */

const CLIENTS_DATA = [
  { name: 'TechCorp S.L.', email: 'admin@techcorp.es', address: 'Av. Diagonal 123, 08028 Barcelona', phone: '+34 93 123 4567', taxId: 'B12345674' },
  { name: 'Diseños Luna', email: 'info@lunadesign.com', address: 'C/ Gran Via 42, 28013 Madrid', phone: '+34 91 234 5678', taxId: 'B24681355' },
  { name: 'Consulting Pro', email: 'contacto@consultingpro.es', address: 'Plaza España 8, 41001 Sevilla', phone: '+34 95 345 6789', taxId: 'B13579248' },
  { name: 'MarketBoost Agency', email: 'hola@marketboost.es', address: 'C/ Alcalá 200, 28028 Madrid', phone: '+34 91 456 7890', taxId: 'B97531248' },
  { name: 'Restaurante El Olivo', email: 'reservas@elolivo.es', address: 'Paseo de la Castellana 50, 28046 Madrid', phone: '+34 91 567 8901', taxId: 'B46820130' },
  { name: 'Inmobiliaria Costa', email: 'info@inmocosta.com', address: 'Av. del Mar 15, 29620 Torremolinos', phone: '+34 95 678 9012', taxId: 'B23456783' },
  { name: 'StartupXYZ', email: 'ceo@startupxyz.io', address: 'C/ Serrano 100, 28006 Madrid', phone: '+34 91 789 0123', taxId: 'B67890129' },
  { name: 'Clínica Dental Sonrisa', email: 'citas@clinicasonrisa.es', address: 'C/ Valencia 88, 46005 Valencia', phone: '+34 96 890 1234', taxId: 'B54321096' },
  { name: 'Logística Rápida S.A.', email: 'ops@logisticarapida.es', address: 'Pol. Ind. Norte, nave 12, 50014 Zaragoza', phone: '+34 97 901 2345', taxId: 'A65432106' },
  { name: 'Estudio Creativo Bloom', email: 'hello@bloomstudio.es', address: 'C/ Pelai 28, 08001 Barcelona', phone: '+34 93 012 3456', taxId: 'B87654323' },
]

const FROM_COMPANY = {
  name: 'GENIOVA TECHNOLOGIES, S.L.',
  email: 'administracion@geniova.com',
  address: 'C/ Tecnología 1, 28001 Madrid',
  phone: '+34 910 851 716',
  taxId: 'B87108585',
  logo: LOGOS.acme,
  signature: SIGNATURES.sig1,
  signatureLabel: 'Administrador',
}

const ITEMS_POOL = [
  { description: 'Diseño UI/UX - Landing page', unitPrice: 2400 },
  { description: 'Desarrollo Frontend React', unitPrice: 4800 },
  { description: 'Desarrollo Backend Node.js', unitPrice: 5200 },
  { description: 'Consultoría estratégica digital', unitPrice: 1200 },
  { description: 'Gestión de redes sociales (mensual)', unitPrice: 800 },
  { description: 'Campaña Google Ads - Setup + 1 mes', unitPrice: 1500 },
  { description: 'Diseño de identidad corporativa', unitPrice: 3500 },
  { description: 'Fotografía profesional (sesión)', unitPrice: 650 },
  { description: 'Mantenimiento web (trimestral)', unitPrice: 900 },
  { description: 'Auditoría SEO completa', unitPrice: 1800 },
  { description: 'Desarrollo App móvil (fase 1)', unitPrice: 8500 },
  { description: 'Copywriting web (5 páginas)', unitPrice: 750 },
  { description: 'Video corporativo (producción)', unitPrice: 4200 },
  { description: 'Hosting y dominio (anual)', unitPrice: 120 },
  { description: 'Formación equipo (8h)', unitPrice: 1600 },
]

const TEMPLATE_STYLES = ['default', 'minimal', 'corporate', 'creative'] as const

function randomDate(monthsBack: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsBack))
  d.setDate(1 + Math.floor(Math.random() * 28))
  return d.toISOString().split('T')[0]
}

function randomDateTimestamp(monthsBack: number): Timestamp {
  const d = new Date()
  d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsBack))
  d.setDate(1 + Math.floor(Math.random() * 28))
  return Timestamp.fromDate(d)
}

function pickItems(min: number, max: number, vatLineId: string) {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...ITEMS_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((item, idx) => {
    const qty = 1 + Math.floor(Math.random() * 3)
    return {
      id: crypto.randomUUID(),
      description: item.description,
      quantity: qty,
      unitPrice: item.unitPrice,
      amount: qty * item.unitPrice,
      sortOrder: idx,
      vatLineId,
    }
  })
}

function dueDate(issueDate: string, days: number): string {
  const d = new Date(issueDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// Simple hash for demo purposes (not real SHA-256, just for display)
function fakeHash(): string {
  const chars = '0123456789abcdef'
  let hash = ''
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)]
  return hash
}

/* ─── Delete all user data ─── */

async function deleteCollection(userId: string, collectionName: string) {
  const db = getFirebaseDb()
  const q = query(collection(db, collectionName), where('userId', '==', userId))
  const snap = await getDocs(q)
  const deletes = snap.docs.map((d) => deleteDoc(doc(db, collectionName, d.id)))
  await Promise.all(deletes)
  return snap.size
}

// Purge ALL clients matching demo emails regardless of userId
// (handles orphaned records from previous seed runs under different accounts)
async function deleteDemoClientsByEmail() {
  const db = getFirebaseDb()
  const demoEmails = CLIENTS_DATA.map((c) => c.email)
  const snap = await getDocs(collection(db, 'clients'))
  const deletes = snap.docs
    .filter((d) => demoEmails.includes(d.data().email))
    .map((d) => deleteDoc(doc(db, 'clients', d.id)))
  await Promise.all(deletes)
}

/* ─── Seed function ─── */

export async function seedDemoData(userId: string): Promise<{ invoices: number; quotes: number; clients: number; templates: number }> {
  const db = getFirebaseDb()

  // 0. Delete ALL existing data for this user + any orphaned demo clients from other sessions
  await deleteCollection(userId, 'invoices')
  await deleteDemoClientsByEmail()   // removes duplicates across all userIds
  await deleteCollection(userId, 'templates')

  // 1. Create 10 clients
  for (const client of CLIENTS_DATA) {
    const ref = doc(collection(db, 'clients'))
    await setDoc(ref, {
      userId,
      ...client,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // 2. Create 3 templates
  const templateConfigs = [
    { name: 'Geniova - Clásico', style: 'default' as const, company: FROM_COMPANY },
    { name: 'Geniova - Corporativo', style: 'corporate' as const, company: FROM_COMPANY },
    { name: 'Geniova - Creativo', style: 'creative' as const, company: FROM_COMPANY },
  ]

  for (const tmpl of templateConfigs) {
    const ref = doc(collection(db, 'templates'))
    await setDoc(ref, {
      userId,
      name: tmpl.name,
      isDefault: false,
      data: {
        templateStyle: tmpl.style,
        documentType: 'invoice',
        title: 'Factura',
        currency: 'EUR',
        language: 'es',
        fromName: tmpl.company.name,
        fromEmail: tmpl.company.email,
        fromAddress: tmpl.company.address,
        fromPhone: tmpl.company.phone,
        fromTaxId: tmpl.company.taxId,
        fromLogoUrl: tmpl.company.logo,
        signatureUrl: tmpl.company.signature,
        signatureLabel: tmpl.company.signatureLabel,
        taxRate: 21,
        invoiceType: 'F1',
        bankName: 'Banco Santander',
        bankAccount: 'ES12 0049 1234 5678 9012 3456',
        bankSwift: 'BSCHESMM',
        notes: 'Gracias por confiar en nosotros.',
        terms: 'Pago a 30 días desde la fecha de emisión.',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // 3. Create 10 invoices with VeriFactu format
  const invoiceConfigs: Array<{
    status: 'draft' | 'emitted' | 'sent' | 'paid' | 'overdue'
    verifactuStatus: 'none' | 'accepted' | 'rejected'
    emitted: boolean
  }> = [
    { status: 'paid', verifactuStatus: 'accepted', emitted: true },
    { status: 'paid', verifactuStatus: 'accepted', emitted: true },
    { status: 'emitted', verifactuStatus: 'accepted', emitted: true },
    { status: 'emitted', verifactuStatus: 'accepted', emitted: true },
    { status: 'paid', verifactuStatus: 'accepted', emitted: true },
    { status: 'sent', verifactuStatus: 'accepted', emitted: true },
    { status: 'draft', verifactuStatus: 'none', emitted: false },
    { status: 'draft', verifactuStatus: 'none', emitted: false },
    { status: 'overdue', verifactuStatus: 'rejected', emitted: false },
    { status: 'draft', verifactuStatus: 'none', emitted: false },
  ]

  let prevHash = ''

  for (let i = 0; i < 10; i++) {
    const company = FROM_COMPANY
    const client = CLIENTS_DATA[i]
    const vatLineId = 'vat-21'
    const items = pickItems(1, 4, vatLineId)
    const subtotal = items.reduce((s, it) => s + it.amount, 0)
    const taxRate = 21
    const discountRate = i % 3 === 0 ? 10 : 0
    const discountAmount = subtotal * (discountRate / 100)
    const baseImponible = subtotal - discountAmount
    const taxAmount = baseImponible * (taxRate / 100)
    const total = baseImponible + taxAmount
    const cfg = invoiceConfigs[i]
    const issDate = randomDate(6)
    const amountPaid = cfg.status === 'paid' ? total : 0
    const style = TEMPLATE_STYLES[i % TEMPLATE_STYLES.length]
    const createdTimestamp = randomDateTimestamp(6)

    const hash = cfg.emitted ? fakeHash() : ''
    const qrUrl = cfg.emitted
      ? `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=${company.taxId}&numserie=FAC-2026-${String(i + 1).padStart(3, '0')}&fecha=${issDate}&importe=${total.toFixed(2)}`
      : ''

    const ref = doc(collection(db, 'invoices'))
    await setDoc(ref, {
      userId,
      templateStyle: style,
      documentType: 'invoice',
      invoiceType: 'F1',
      title: 'Factura',
      invoiceNumber: `FAC-2026-${String(i + 1).padStart(3, '0')}`,
      status: cfg.status,
      currency: 'EUR',
      language: 'es',
      issueDate: issDate,
      dueDate: dueDate(issDate, 30),
      fromName: company.name,
      fromEmail: company.email,
      fromAddress: company.address,
      fromPhone: company.phone,
      fromTaxId: company.taxId,
      fromLogoUrl: company.logo,
      billToName: client.name,
      billToEmail: client.email,
      billToAddress: client.address,
      billToPhone: client.phone,
      billToTaxId: client.taxId,
      shipToName: '',
      shipToAddress: '',
      subtotal,
      taxRate,
      taxAmount,
      discountRate,
      discountAmount,
      shippingAmount: 0,
      total,
      amountPaid,
      balanceDue: total - amountPaid,
      // VeriFactu fields
      vatBreakdown: [{ rate: taxRate, base: baseImponible, quota: taxAmount }],
      verifactuHash: hash,
      verifactuPreviousHash: prevHash,
      verifactuStatus: cfg.verifactuStatus,
      verifactuQrUrl: qrUrl,
      emittedAt: cfg.emitted ? new Date(issDate).toISOString() : null,
      aeatCsv: cfg.emitted ? `CSV-DEMO-${Date.now()}-${i}` : null,
      aeatResponseCode: cfg.verifactuStatus === 'rejected' ? 'ERR001' : '',
      aeatResponseMessage: cfg.verifactuStatus === 'rejected' ? 'Error de conexión simulado' : '',
      // Standard fields
      bankName: 'Banco Santander',
      bankAccount: 'ES12 0049 1234 5678 9012 3456',
      bankSwift: 'BSCHESMM',
      notes: 'Gracias por su confianza.',
      terms: 'Pago a 30 días desde la fecha de emisión.',
      signatureUrl: company.signature,
      signatureLabel: company.signatureLabel,
      items,
      createdAt: createdTimestamp,
      updatedAt: createdTimestamp,
    })

    if (hash) prevHash = hash
  }

  // 4. Create 10 quotes
  const quoteStatuses: Array<'draft' | 'sent' | 'paid' | 'cancelled'> = [
    'paid', 'paid', 'paid', 'sent', 'sent', 'sent', 'draft', 'draft', 'cancelled', 'paid',
  ]

  for (let i = 0; i < 10; i++) {
    const company = FROM_COMPANY
    const client = CLIENTS_DATA[9 - i]
    const vatLineId = 'vat-21'
    const items = pickItems(2, 5, vatLineId)
    const subtotal = items.reduce((s, it) => s + it.amount, 0)
    const taxRate = 21
    const discountRate = i % 4 === 0 ? 5 : 0
    const discountAmount = subtotal * (discountRate / 100)
    const baseImponible = subtotal - discountAmount
    const taxAmount = baseImponible * (taxRate / 100)
    const total = baseImponible + taxAmount
    const status = quoteStatuses[i]
    const issDate = randomDate(5)
    const style = TEMPLATE_STYLES[(i + 1) % TEMPLATE_STYLES.length]
    const createdTimestamp = randomDateTimestamp(5)

    const ref = doc(collection(db, 'invoices'))
    await setDoc(ref, {
      userId,
      templateStyle: style,
      documentType: 'quote',
      title: 'Presupuesto',
      invoiceNumber: `PRES-2026-${String(i + 1).padStart(3, '0')}`,
      status,
      currency: 'EUR',
      language: 'es',
      issueDate: issDate,
      dueDate: dueDate(issDate, 15),
      fromName: company.name,
      fromEmail: company.email,
      fromAddress: company.address,
      fromPhone: company.phone,
      fromTaxId: company.taxId,
      fromLogoUrl: company.logo,
      billToName: client.name,
      billToEmail: client.email,
      billToAddress: client.address,
      billToPhone: client.phone,
      billToTaxId: client.taxId,
      shipToName: '',
      shipToAddress: '',
      subtotal,
      taxRate,
      taxAmount,
      discountRate,
      discountAmount,
      shippingAmount: 0,
      total,
      amountPaid: 0,
      balanceDue: total,
      vatBreakdown: [{ rate: taxRate, base: baseImponible, quota: taxAmount }],
      verifactuStatus: 'none',
      bankName: 'Banco Santander',
      bankAccount: 'ES12 0049 1234 5678 9012 3456',
      bankSwift: 'BSCHESMM',
      notes: 'Presupuesto válido durante 15 días.',
      terms: 'Aceptación por escrito requerida para iniciar el proyecto.',
      signatureUrl: company.signature,
      signatureLabel: company.signatureLabel,
      items,
      createdAt: createdTimestamp,
      updatedAt: createdTimestamp,
    })
  }

  return { invoices: 10, quotes: 10, clients: 10, templates: 3 }
}
