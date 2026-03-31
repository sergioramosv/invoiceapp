'use client'

import { useState, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInvoice } from '@/hooks/useInvoice'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import A4Page from '@/components/invoice/A4Page'
import { downloadDemoPDF } from '@/lib/generate-pdf'
import { useDemo, DEMO_USER_ID } from '@/lib/demo-context'
import { firestoreToInvoiceState } from '@/lib/invoice-converter'
import { getSubtotal, getDiscountAmount, getTaxAmount, getTotal, getBalanceDue, getVatBreakdown } from '@/types/invoice'
import { useI18n } from '@/lib/i18n'

export default function DemoEditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { getInvoice, updateInvoice: updateDemoInvoice } = useDemo()
  const { t } = useI18n()
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)

  const invoice = getInvoice(id)

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-muted">{t('workspace.noResults') || 'Documento no encontrado'}</p>
          <Link href="/demo/invoices" className="mt-4 inline-block text-accent hover:underline">
            {t('nav.invoices') || 'Volver a facturas'}
          </Link>
        </div>
      </div>
    )
  }

  return <DemoEditEditor invoice={invoice} updateDemoInvoice={updateDemoInvoice} />
}

function DemoEditEditor({ invoice, updateDemoInvoice }: {
  invoice: NonNullable<ReturnType<ReturnType<typeof useDemo>['getInvoice']>>
  updateDemoInvoice: ReturnType<typeof useDemo>['updateInvoice']
}) {
  const { t } = useI18n()
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)

  const initialState = firestoreToInvoiceState(invoice)
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue, vatBreakdown } =
    useInvoice(initialState)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [showEmitSuccess, setShowEmitSuccess] = useState(false)
  const [emitting, setEmitting] = useState(false)

  function handleSave() {
    setSaving(true)
    try {
      updateDemoInvoice(invoice.id, {
        title: state.title || '',
        invoiceNumber: state.invoiceNumber || '',
        currency: state.currency.code,
        language: state.language.code,
        issueDate: state.issueDate || '',
        dueDate: state.dueDate || '',
        fromName: state.fromName || '',
        fromEmail: state.fromEmail || '',
        fromAddress: state.fromAddress || '',
        fromPhone: state.fromPhone || '',
        fromTaxId: state.fromTaxId || '',
        fromLogoUrl: state.logoUrl || '',
        billToName: state.billToName || '',
        billToEmail: state.billToEmail || '',
        billToAddress: state.billToAddress || '',
        billToPhone: state.billToPhone || '',
        billToTaxId: state.billToTaxId || '',
        items: state.items.map((item, i) => ({ ...item, sortOrder: i })),
        subtotal: getSubtotal(state),
        taxRate: state.taxRate || 0,
        taxAmount: getTaxAmount(state),
        discountRate: state.discountRate || 0,
        discountAmount: getDiscountAmount(state),
        shippingAmount: state.shippingAmount || 0,
        total: getTotal(state),
        amountPaid: state.amountPaid || 0,
        balanceDue: getBalanceDue(state),
        vatBreakdown: getVatBreakdown(state),
        notes: state.notes || '',
        terms: state.terms || '',
      })

      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      await downloadDemoPDF(previewRef.current, state.invoiceNumber)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border bg-surface px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/demo/invoices" className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors text-text-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">{state.invoiceNumber || (t('editor.editDocument') || 'Editar documento')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex lg:hidden border border-border rounded-lg overflow-hidden">
            <button onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-text text-surface' : 'bg-surface text-text-secondary'}`}>
              {t('editor.edit') || 'Editar'}
            </button>
            <button onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-text text-surface' : 'bg-surface text-text-secondary'}`}>
              {t('editor.preview') || 'Vista previa'}
            </button>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors disabled:opacity-50">
            {saving ? (t('editor.saving') || 'Guardando...') : (t('editor.save') || 'Guardar')}
          </button>

          {state.documentType === 'invoice' && (
            <button
              onClick={() => {
                setEmitting(true)
                setTimeout(() => { setEmitting(false); setShowEmitSuccess(true); setTimeout(() => setShowEmitSuccess(false), 3000) }, 1500)
              }}
              disabled={emitting || saving}
              className="hidden sm:flex px-4 py-2 text-sm bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {emitting ? (t('verifactu.emitting') || 'Emitiendo...') : (t('verifactu.emit') || 'Emitir VeriFactu')}
            </button>
          )}

          <button onClick={handleDownloadPDF} disabled={downloading}
            className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors flex items-center gap-2 disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">{downloading ? (t('editor.generating') || 'Generando...') : 'PDF'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full lg:w-[65%] xl:w-[70%] overflow-y-auto p-4 sm:p-6 bg-surface ${activeTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
          <InvoiceForm state={state} dispatch={dispatch} subtotal={subtotal} discountAmount={discountAmount} taxAmount={taxAmount} total={total} balanceDue={balanceDue} vatBreakdown={vatBreakdown} />
        </div>
        <div className={`w-full lg:w-[35%] xl:w-[30%] overflow-y-auto p-4 bg-surface-tertiary border-l border-border ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="lg:sticky lg:top-0">
            <A4Page ref={previewRef}>
              <InvoicePreview state={state} subtotal={subtotal} discountAmount={discountAmount} taxAmount={taxAmount} total={total} balanceDue={balanceDue} />
            </A4Page>
          </div>
        </div>
      </div>

      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3 bg-success text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{t('editor.saved') || 'Guardado'}</span>
          </div>
        </div>
      )}

      {showEmitSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3 bg-success text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium">{t('verifactu.successTitle') || 'Emitido a VeriFactu'} (demo)</span>
          </div>
        </div>
      )}
    </div>
  )
}
