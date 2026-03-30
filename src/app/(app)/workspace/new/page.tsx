'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInvoice } from '@/hooks/useInvoice'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'

export default function NewInvoicePage() {
  const { state, dispatch, subtotal, discountAmount, taxAmount, total, balanceDue } =
    useInvoice()
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

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
          <h1 className="text-lg font-semibold">Nueva Factura</h1>
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

          {/* Download PDF placeholder */}
          <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
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
            <span className="hidden sm:inline">Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form panel (left) */}
        <div
          className={`w-full lg:w-[55%] overflow-y-auto p-4 sm:p-6 bg-surface-secondary ${
            activeTab === 'edit' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-4 sm:p-6">
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
        </div>

        {/* Preview panel (right) */}
        <div
          className={`w-full lg:w-[45%] overflow-y-auto p-4 sm:p-6 bg-surface-tertiary border-l border-border ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="lg:sticky lg:top-0">
            <InvoicePreview
              state={state}
              subtotal={subtotal}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              total={total}
              balanceDue={balanceDue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
