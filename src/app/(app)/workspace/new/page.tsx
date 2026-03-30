'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { useInvoice } from '@/hooks/useInvoice'
import { useAuth } from '@/lib/auth-context'
import { getFirebaseDb } from '@/lib/firebase'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import A4Page from '@/components/invoice/A4Page'
import { downloadPDF, downloadPNG } from '@/lib/generate-pdf'
import { createInvoice, getTemplate, createTemplate, getNextInvoiceNumber } from '@/lib/firestore'
import { invoiceStateToFirestore } from '@/lib/invoice-converter'
import { InvoiceState, createInitialState } from '@/types/invoice'
import { PromptModal } from '@/components/ui/Modal'

export default function NewInvoicePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewInvoicePage />
    </Suspense>
  )
}

function NewInvoicePage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const saveAsTemplateMode = searchParams.get('saveAsTemplate') === 'true'

  const [initialState, setInitialState] = useState<InvoiceState | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (ready) return
    async function load() {
      if (templateId) {
        try {
          const template = await getTemplate(templateId)
          if (template && template.data) {
            setInitialState(template.data as unknown as InvoiceState)
          } else {
            setInitialState(createInitialState())
          }
        } catch {
          setInitialState(createInitialState())
        }
      } else {
        setInitialState(createInitialState())
      }
      setReady(true)
    }
    load()
  }, [templateId, ready])

  if (!ready || !initialState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <NewInvoiceEditor initialState={initialState} user={user} router={router} saveAsTemplateMode={saveAsTemplateMode} />
}

function NewInvoiceEditor({
  initialState,
  user,
  router,
  saveAsTemplateMode,
}: {
  initialState: InvoiceState
  user: ReturnType<typeof useAuth>['user']
  router: ReturnType<typeof useRouter>
  saveAsTemplateMode: boolean
}) {
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoice(initialState)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false)
  const [downloadingPNG, setDownloadingPNG] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Auto-set invoice number on mount
  useEffect(() => {
    async function autoSetNumber() {
      if (!user || state.invoiceNumber) return
      try {
        const nextNum = await getNextInvoiceNumber(user.uid)
        // If document type is quote, replace the prefix with PRES-
        const number = state.documentType === 'quote'
          ? nextNum.replace(/^[A-Z]+-/, 'PRES-')
          : nextNum
        dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: number })
      } catch (err) {
        console.error('Error getting next invoice number:', err)
      }
    }
    autoSetNumber()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Update invoice number prefix when document type changes
  useEffect(() => {
    if (!state.invoiceNumber) return
    const currentNum = state.invoiceNumber.replace(/^[A-Z]+-/, '')
    if (state.documentType === 'quote') {
      dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: `PRES-${currentNum}` })
    } else {
      dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: `INV-${currentNum}` })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.documentType])

  useEffect(() => {
    async function checkPaidStatus() {
      if (!user) return
      try {
        const db = getFirebaseDb()
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setIsPaid(userDoc.data().isPaid === true)
        }
      } catch {
        // Default to free
      }
    }
    checkPaidStatus()
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      if (saveAsTemplateMode) {
        setShowTemplatePrompt(true)
        setSaving(false)
        return
      } else {
        let invoiceNumber = state.invoiceNumber
        if (!invoiceNumber) {
          invoiceNumber = await getNextInvoiceNumber(user.uid)
          dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: invoiceNumber })
        }
        const data = invoiceStateToFirestore(
          { ...state, invoiceNumber },
          user.uid,
          'draft'
        )
        await createInvoice(data)
        router.push('/workspace')
      }
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      await downloadPDF(previewRef.current, state.invoiceNumber, isPaid)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDownloadPNG() {
    if (!previewRef.current) return
    setDownloadingPNG(true)
    try {
      const filename = state.invoiceNumber
        ? `factura-${state.invoiceNumber}`
        : 'factura'
      await downloadPNG(previewRef.current, filename)
    } catch (err) {
      console.error('Error generating PNG:', err)
    } finally {
      setDownloadingPNG(false)
    }
  }

  async function saveTemplate(name: string) {
    if (!user) return
    try {
      await createTemplate({
        userId: user.uid,
        name,
        data: state as unknown as Record<string, unknown>,
        isDefault: false,
      })
      if (saveAsTemplateMode) {
        router.push('/workspace/templates')
      }
    } catch (err) {
      console.error('Error saving template:', err)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Free user banner */}
      {!isPaid && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-warning">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Estas usando el plan gratuito. Las facturas incluyen watermark.</span>
          <Link
            href="/workspace/upgrade"
            className="font-semibold text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
          >
            Eliminar watermark
          </Link>
        </div>
      )}

      {/* Top bar */}
      <div className="border-b border-border bg-surface px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/workspace"
            className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors text-text-secondary"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">{saveAsTemplateMode ? 'Nuevo Template' : 'Nuevo Documento'}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile tab toggle */}
          <div className="flex lg:hidden border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-text text-surface'
                  : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-text text-surface'
                  : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => setShowTemplatePrompt(true)}
            className="hidden sm:flex px-3 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors items-center gap-2 text-text-secondary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Template
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : saveAsTemplateMode ? 'Guardar template' : 'Guardar'}
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloadingPNG}
            className="hidden sm:flex px-3 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors items-center gap-2 text-text-secondary disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {downloadingPNG ? 'Exportando...' : 'PNG'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form panel (left) */}
        <div
          className={`w-full lg:w-[65%] xl:w-[70%] overflow-y-auto p-4 sm:p-6 bg-surface ${
            activeTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          <InvoiceForm
            state={state}
            dispatch={dispatch}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            total={total}
            balanceDue={balanceDue}
          />
        </div>

        {/* Preview panel (right) */}
        <div
          className={`w-full lg:w-[35%] xl:w-[30%] overflow-y-auto p-4 bg-surface-tertiary border-l border-border ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="lg:sticky lg:top-0">
            <A4Page ref={previewRef}>
              <InvoicePreview
                state={state}
                subtotal={subtotal}
                discountAmount={discountAmount}
                taxAmount={taxAmount}
                total={total}
                balanceDue={balanceDue}
              />
            </A4Page>
          </div>
        </div>
      </div>

      <PromptModal
        open={showTemplatePrompt}
        onClose={() => setShowTemplatePrompt(false)}
        onSubmit={saveTemplate}
        title="Nombre del template"
        placeholder="Ej: Mi empresa, Cliente habitual..."
        submitLabel="Guardar template"
      />
    </div>
  )
}
