'use client'

import { useState, useRef, useEffect, use } from 'react'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
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
import { useI18n } from '@/lib/i18n'

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
  const { t } = useI18n()
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue, vatBreakdown } =
    useInvoice(initialState)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [emitting, setEmitting] = useState(false)
  const [showEmitConfirm, setShowEmitConfirm] = useState(false)
  const [emitError, setEmitError] = useState('')
  const [showEmitSuccess, setShowEmitSuccess] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const isEmitted = !!state.emittedAt

  async function handleSave() {
    if (!user || isEmitted) return
    setSaving(true)
    try {
      const data = invoiceStateToFirestore(state, user.uid, 'draft')
      await updateInvoice(invoiceId, data)
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 3000)
    } catch (err) {
      console.error('Error updating invoice:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleEmitClick() {
    if (!user || isEmitted || state.documentType === 'quote') return
    if (!state.fromTaxId) { setEmitError(t('verifactu.needNif')); return }
    setShowEmitConfirm(true)
  }

  async function handleEmitConfirm() {
    if (!user) return
    setShowEmitConfirm(false)
    setEmitting(true)
    try {
      const data = invoiceStateToFirestore(state, user.uid, 'draft')
      await updateInvoice(invoiceId, data)
      const res = await fetch('/api/verifactu/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      const result = await res.json()
      if (result.success) {
        setShowEmitSuccess(true)
      } else {
        setEmitError(result.error || t('verifactu.emitError'))
      }
    } catch (err) {
      console.error('Error emitting:', err)
    } finally {
      setEmitting(false)
    }
  }

  async function handleDownloadPDF() {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      await downloadPDF(previewRef.current, state.invoiceNumber)
    } catch (err) {
      console.error('Error generating PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Emitted banner */}
      {isEmitted && (
        <div className="bg-success/10 border-b border-success/20 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-success">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{t('verifactu.locked')}</span>
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
          <div>
            <h1 className="text-lg font-semibold">
              {state.documentType === 'quote' ? t('editor.editQuote') : t('editor.editInvoice')} {state.invoiceNumber && `- ${state.invoiceNumber}`}
            </h1>
            {isEmitted && (
              <span className="text-xs text-success font-medium">{t('verifactu.emittedBadge')}</span>
            )}
          </div>
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
              {t('editor.edit')}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-text text-surface'
                  : 'bg-surface text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              {t('editor.preview')}
            </button>
          </div>

          {!isEmitted && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors disabled:opacity-50"
            >
              {saving ? t('editor.saving') : t('editor.save')}
            </button>
          )}

          {!isEmitted && state.documentType === 'invoice' && (
            <button
              onClick={handleEmitClick}
              disabled={emitting || saving}
              className="hidden sm:flex px-4 py-2 text-sm bg-success text-white rounded-lg font-medium hover:bg-success/90 transition-colors items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {emitting ? t('verifactu.emitting') : t('verifactu.emit')}
            </button>
          )}

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
              {downloading ? t('editor.generating') : t('editor.downloadPDF')}
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
          <fieldset disabled={isEmitted} className={isEmitted ? 'opacity-70 pointer-events-none' : ''}>
            <InvoiceForm
              state={state}
              dispatch={dispatch}
              subtotal={subtotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              total={total}
              balanceDue={balanceDue}
              vatBreakdown={vatBreakdown}
            />
          </fieldset>
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

      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 px-5 py-3 bg-success text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{t('editor.saved')}</span>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showEmitConfirm}
        onClose={() => setShowEmitConfirm(false)}
        onConfirm={handleEmitConfirm}
        title={t('verifactu.confirmTitle')}
        message={t('verifactu.confirmEmit')}
        confirmLabel={t('verifactu.emit')}
      />

      <Modal open={!!emitError} onClose={() => setEmitError('')}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-danger mb-2">{t('verifactu.emitError')}</h3>
          <p className="text-sm text-text-secondary">{emitError}</p>
          <button
            onClick={() => setEmitError('')}
            className="mt-4 px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium"
          >
            {t('modal.confirm')}
          </button>
        </div>
      </Modal>

      {/* Emit success modal */}
      <Modal open={showEmitSuccess} onClose={() => window.location.reload()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">{t('verifactu.successTitle')}</h3>
          <p className="text-sm text-text-secondary mb-6">{t('verifactu.successDesc')}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                handleDownloadPDF()
                window.location.reload()
              }}
              className="px-5 py-2.5 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('editor.downloadPDF')}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors"
            >
              {t('modal.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
