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
import { PromptModal, Modal } from '@/components/ui/Modal'
import { SendEmailModal } from '@/components/ui/SendEmailModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useI18n } from '@/lib/i18n'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

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
  const { t } = useI18n()
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoice(initialState)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showTemplatePrompt, setShowTemplatePrompt] = useState(false)
  const [downloadingPNG, setDownloadingPNG] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Auto-set invoice number on mount
  useEffect(() => {
    async function autoSetNumber() {
      if (!user || state.invoiceNumber) return
      try {
        const nextNum = await getNextInvoiceNumber(user.uid, state.documentType || 'invoice')
        dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: nextNum })
      } catch (err) {
        console.error('Error getting next invoice number:', err)
      }
    }
    autoSetNumber()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Update invoice number when document type changes
  useEffect(() => {
    if (!user) return
    async function updateNumber() {
      try {
        const nextNum = await getNextInvoiceNumber(user!.uid, state.documentType || 'invoice')
        dispatch({ type: 'SET_FIELD', field: 'invoiceNumber', value: nextNum })
      } catch (err) {
        console.error('Error getting next invoice number:', err)
      }
    }
    updateNumber()
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

  async function generatePDFBase64(): Promise<string | null> {
    if (!previewRef.current) return null
    const dataUrl = await toPng(previewRef.current, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    })
    const img = new Image()
    img.src = dataUrl
    await new Promise<void>((resolve) => { img.onload = () => resolve() })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (img.height * imgWidth) / img.width

    const pdf = new jsPDF('p', 'mm', 'a4')
    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    return pdf.output('datauristring').split(',')[1]
  }

  async function handleSendEmail(data: { recipientEmail: string; subject: string; message: string }) {
    const pdfBase64 = await generatePDFBase64()
    if (!pdfBase64) throw new Error('Failed to generate PDF')
    const filename = state.invoiceNumber ? `factura-${state.invoiceNumber}.pdf` : 'factura.pdf'
    const res = await fetch('/api/invoices/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message,
        pdfBase64,
        filename,
      }),
    })
    if (!res.ok) throw new Error('Failed to send')
  }

  useKeyboardShortcuts([
    { key: 's', ctrl: true, handler: () => handleSave() },
    { key: 'p', ctrl: true, handler: () => handleDownloadPDF() },
    { key: 'p', ctrl: true, shift: true, handler: () => handleDownloadPNG() },
  ])

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
          <span>{t('editor.freeBanner')}</span>
          <Link
            href="/workspace/upgrade"
            className="font-semibold text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
          >
            {t('editor.removeWatermark')}
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
          <h1 className="text-lg font-semibold">{saveAsTemplateMode ? t('editor.newTemplate') : t('editor.newDocument')}</h1>
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

          <button
            onClick={() => setShowTemplatePrompt(true)}
            className="hidden sm:flex px-3 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors items-center gap-2 text-text-secondary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {t('editor.template')}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors disabled:opacity-50"
          >
            {saving ? t('editor.saving') : saveAsTemplateMode ? t('editor.saveTemplate') : t('editor.save')}
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloadingPNG}
            className="hidden sm:flex px-3 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors items-center gap-2 text-text-secondary disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {downloadingPNG ? t('editor.pngExporting') : t('editor.png')}
          </button>

          <button
            onClick={() => setShowEmailModal(true)}
            className="hidden sm:flex px-3 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors items-center gap-2 text-text-secondary"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {t('email.send')}
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
              {downloading ? t('editor.generating') : t('editor.downloadPDF')}
            </span>
          </button>

          <button
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors text-text-secondary"
            title={t('shortcuts.help')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
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
        title={t('modal.templateName')}
        placeholder={t('modal.templatePlaceholder')}
        submitLabel={t('modal.saveTemplate')}
      />

      <SendEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail}
        defaultEmail={state.billToEmail}
        defaultSubject={`${t('email.subjectDefault')} ${state.invoiceNumber || ''}`}
      />

      <Modal open={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)}>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{t('shortcuts.title')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">{t('shortcuts.save')}</span>
              <kbd className="px-2 py-1 bg-surface-tertiary border border-border rounded text-xs font-mono">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border">
              <span className="text-text-secondary">{t('shortcuts.pdf')}</span>
              <kbd className="px-2 py-1 bg-surface-tertiary border border-border rounded text-xs font-mono">Ctrl+P</kbd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-text-secondary">{t('shortcuts.png')}</span>
              <kbd className="px-2 py-1 bg-surface-tertiary border border-border rounded text-xs font-mono">Ctrl+Shift+P</kbd>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              {t('modal.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
