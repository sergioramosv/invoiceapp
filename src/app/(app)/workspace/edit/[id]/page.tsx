'use client'

import { useState, useRef, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInvoice } from '@/hooks/useInvoice'
import { useAuth } from '@/lib/auth-context'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import A4Page from '@/components/invoice/A4Page'
import { downloadPDF } from '@/lib/generate-pdf'
import { getInvoice, updateInvoice } from '@/lib/firestore'
import { invoiceStateToFirestore, firestoreToInvoiceState } from '@/lib/invoice-converter'
import { InvoiceState } from '@/types/invoice'

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [initialState, setInitialState] = useState<InvoiceState | null>(null)
  const [loadingInvoice, setLoadingInvoice] = useState(true)
  const [invoiceId, setInvoiceId] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    async function loadInvoice() {
      try {
        const invoice = await getInvoice(id)
        if (!invoice) {
          router.push('/workspace')
          return
        }
        setInvoiceId(invoice.id)
        setInitialState(firestoreToInvoiceState(invoice))
      } catch (err) {
        console.error('Error loading invoice:', err)
        router.push('/workspace')
      } finally {
        setLoadingInvoice(false)
      }
    }

    if (user) loadInvoice()
  }, [id, user, authLoading, router])

  if (authLoading || loadingInvoice || !initialState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <EditInvoiceEditor
      initialState={initialState}
      invoiceId={invoiceId}
      user={user}
      router={router}
    />
  )
}

function EditInvoiceEditor({
  initialState,
  invoiceId,
  user,
  router,
}: {
  initialState: InvoiceState
  invoiceId: string
  user: ReturnType<typeof useAuth>['user']
  router: ReturnType<typeof useRouter>
}) {
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoice(initialState)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const isFreeUser = true

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const data = invoiceStateToFirestore(state, user.uid, 'draft')
      await updateInvoice(invoiceId, data)
      router.push('/workspace')
    } catch (err) {
      console.error('Error updating invoice:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      await downloadPDF(previewRef.current, state.invoiceNumber, isFreeUser)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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
          <h1 className="text-lg font-semibold">
            Editar Factura {state.invoiceNumber && `- ${state.invoiceNumber}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile tab toggle */}
          <div className="flex lg:hidden border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              Editar
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
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
    </div>
  )
}
