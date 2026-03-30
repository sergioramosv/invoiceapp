'use client'

import { Dispatch } from 'react'
import {
  InvoiceState,
  CURRENCIES,
  LANGUAGES,
  DOCUMENT_TYPES,
  Currency,
  Language,
  DocumentType,
} from '@/types/invoice'
import { TEMPLATE_STYLES, TemplateStyle } from '@/lib/invoice-templates'
import SignaturePad from './SignaturePad'
import { useI18n } from '@/lib/i18n'

type InvoiceAction =
  | { type: 'SET_FIELD'; field: keyof InvoiceState; value: unknown }
  | { type: 'SET_CURRENCY'; currency: Currency }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'ADD_ITEM' }
  | { type: 'UPDATE_ITEM'; id: string; field: string; value: unknown }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'ADD_CUSTOM_FIELD' }
  | { type: 'UPDATE_CUSTOM_FIELD'; id: string; field: string; value: unknown }
  | { type: 'REMOVE_CUSTOM_FIELD'; id: string }
  | { type: 'ADD_BANK_FIELD' }
  | { type: 'UPDATE_BANK_FIELD'; id: string; field: string; value: unknown }
  | { type: 'REMOVE_BANK_FIELD'; id: string }
  | { type: 'TOGGLE_SHIPPING' }

interface InvoiceFormProps {
  state: InvoiceState
  dispatch: Dispatch<InvoiceAction>
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  balanceDue: number
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function InvoiceForm({
  state,
  dispatch,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  balanceDue,
}: InvoiceFormProps) {
  const { t } = useI18n()
  const labels = state.language.labels
  const sym = state.currency.symbol

  return (
    <div className="space-y-6">
      {/* Template selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          {t('form.style')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEMPLATE_STYLES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() =>
                dispatch({ type: 'SET_FIELD', field: 'templateStyle', value: tmpl.id as TemplateStyle })
              }
              className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                state.templateStyle === tmpl.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/40 bg-surface'
              }`}
            >
              {/* Mini preview thumbnail */}
              <div className="mb-2 h-14 rounded-lg overflow-hidden light-paper">
                {tmpl.id === 'default' && (
                  <div className="h-full bg-white border border-border/40 p-1.5 flex flex-col gap-0.5">
                    <div className="flex justify-between">
                      <div className="w-4 h-2 bg-text/20 rounded-sm" />
                      <div className="w-6 h-2 bg-primary/30 rounded-sm" />
                    </div>
                    <div className="flex-1 space-y-0.5 mt-1">
                      <div className="h-1 bg-border rounded-full" />
                      <div className="h-1 bg-border rounded-full" />
                      <div className="h-1 bg-border/60 rounded-full w-3/4" />
                    </div>
                    <div className="h-2 bg-text/10 rounded-sm w-1/2 ml-auto" />
                  </div>
                )}
                {tmpl.id === 'minimal' && (
                  <div className="h-full bg-white p-1.5 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <div className="w-5 h-1.5 bg-text/10 rounded-sm" />
                      <div className="w-4 h-1.5 bg-text/10 rounded-sm" />
                    </div>
                    <div className="flex-1 space-y-1 mt-1">
                      <div className="h-px bg-text/10" />
                      <div className="h-px bg-text/10" />
                    </div>
                    <div className="h-1.5 bg-text/10 rounded-sm w-1/3 ml-auto" />
                  </div>
                )}
                {tmpl.id === 'corporate' && (
                  <div className="h-full bg-white flex flex-col">
                    <div className="h-3 bg-text rounded-t-sm px-1 flex items-center">
                      <div className="w-3 h-1 bg-white/40 rounded-sm" />
                    </div>
                    <div className="flex-1 p-1 space-y-0.5">
                      <div className="h-1 bg-text/10 rounded-full" />
                      <div className="h-1 bg-text/5 rounded-full" />
                      <div className="h-1 bg-text/10 rounded-full" />
                      <div className="h-1 bg-text/5 rounded-full" />
                    </div>
                  </div>
                )}
                {tmpl.id === 'creative' && (
                  <div className="h-full bg-white flex">
                    <div className="w-1 bg-accent rounded-l-sm" />
                    <div className="flex-1 p-1.5 flex flex-col gap-0.5">
                      <div className="w-5 h-1.5 bg-accent/30 rounded-sm" />
                      <div className="flex-1 space-y-0.5 mt-0.5">
                        <div className="h-1 bg-border rounded-full" />
                        <div className="h-1 bg-border rounded-full" />
                      </div>
                      <div className="h-1.5 bg-accent/20 rounded-md w-1/2 ml-auto" />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-text">{tmpl.name}</p>
              <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Header row: Doc Type, Title, Currency, Language */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('form.type')}
          </label>
          <select
            value={state.documentType}
            onChange={(e) => {
              const dt = e.target.value as DocumentType
              const label = DOCUMENT_TYPES.find((d) => d.value === dt)?.labels[state.language.code] || dt
              dispatch({ type: 'SET_FIELD', field: 'documentType', value: dt })
              dispatch({ type: 'SET_FIELD', field: 'title', value: label })
            }}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.labels[state.language.code]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('form.title')}
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('form.currency')}
          </label>
          <select
            value={state.currency.code}
            onChange={(e) => {
              const c = CURRENCIES.find((c) => c.code === e.target.value)
              if (c) dispatch({ type: 'SET_CURRENCY', currency: c })
            }}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} - {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('form.language')}
          </label>
          <select
            value={state.language.code}
            onChange={(e) => {
              const l = LANGUAGES.find((l) => l.code === e.target.value)
              if (l) dispatch({ type: 'SET_LANGUAGE', language: l })
            }}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* From section */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{labels.from}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.logo')}
            </label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center text-text-secondary text-sm cursor-pointer hover:border-primary/40 transition-colors relative"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const file = e.dataTransfer.files?.[0]
                if (file && file.size <= 2 * 1024 * 1024 && /\.(png|jpe?g|svg|webp)$/i.test(file.name)) {
                  const reader = new FileReader()
                  reader.onload = () => dispatch({ type: 'SET_FIELD', field: 'logoUrl', value: reader.result as string })
                  reader.readAsDataURL(file)
                }
              }}
              onClick={() => document.getElementById('logo-input')?.click()}
            >
              <input
                id="logo-input"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.size <= 2 * 1024 * 1024) {
                    const reader = new FileReader()
                    reader.onload = () => dispatch({ type: 'SET_FIELD', field: 'logoUrl', value: reader.result as string })
                    reader.readAsDataURL(file)
                  }
                }}
              />
              {state.logoUrl ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={state.logoUrl} alt="Logo" className="h-12 object-contain" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch({ type: 'SET_FIELD', field: 'logoUrl', value: '' })
                    }}
                    className="text-danger text-xs underline"
                  >
                    {t('form.logoDelete')}
                  </button>
                </div>
              ) : (
                <span>{t('form.logoUpload')}</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.companyName')}
            </label>
            <input
              type="text"
              value={state.fromName}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'fromName', value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.email')}
            </label>
            <input
              type="email"
              value={state.fromEmail}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'fromEmail', value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.address')}
            </label>
            <textarea
              rows={2}
              value={state.fromAddress}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'fromAddress', value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.phone')}
              </label>
              <input
                type="tel"
                value={state.fromPhone}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'fromPhone', value: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.taxId')}
              </label>
              <input
                type="text"
                value={state.fromTaxId}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'fromTaxId', value: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bill To section */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{labels.billTo}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.companyName')}
            </label>
            <input
              type="text"
              value={state.billToName}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'billToName', value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.email')}
            </label>
            <input
              type="email"
              value={state.billToEmail}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'billToEmail', value: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.address')}
            </label>
            <textarea
              rows={2}
              value={state.billToAddress}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'billToAddress',
                  value: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.phone')}
              </label>
              <input
                type="tel"
                value={state.billToPhone}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'billToPhone',
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.taxId')}
              </label>
              <input
                type="text"
                value={state.billToTaxId}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'billToTaxId',
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shipping toggle */}
      <div className="border-t border-border pt-6 mt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.showShipping}
            onChange={() => dispatch({ type: 'TOGGLE_SHIPPING' })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span className="text-sm font-medium text-text-secondary">
            {t('form.includeShipping')}
          </span>
        </label>
        {state.showShipping && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.name')}
              </label>
              <input
                type="text"
                value={state.shipToName}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'shipToName',
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.address')}
              </label>
              <textarea
                rows={2}
                value={state.shipToAddress}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'shipToAddress',
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Invoice fields (number, dates, custom) */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('form.details')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {labels.invoiceNumber}
            </label>
            <input
              type="text"
              value={state.invoiceNumber}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'invoiceNumber',
                  value: e.target.value,
                })
              }
              placeholder="INV-001"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {labels.issueDate}
            </label>
            <input
              type="date"
              value={state.issueDate}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'issueDate',
                  value: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {labels.dueDate}
            </label>
            <input
              type="date"
              value={state.dueDate}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'dueDate',
                  value: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Custom fields */}
        {state.customFields.map((field) => (
          <div key={field.id} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.label')}
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CUSTOM_FIELD',
                    id: field.id,
                    field: 'label',
                    value: e.target.value,
                  })
                }
                placeholder={t('form.label')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('form.value')}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CUSTOM_FIELD',
                    id: field.id,
                    field: 'value',
                    value: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={field.type}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_CUSTOM_FIELD',
                    id: field.id,
                    field: 'type',
                    value: e.target.value,
                  })
                }
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
              >
                <option value="text">{t('form.fieldText')}</option>
                <option value="date">{t('form.fieldDate')}</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'REMOVE_CUSTOM_FIELD', id: field.id })
                }
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title={t('action.delete')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_CUSTOM_FIELD' })}
          className="mt-4 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
        >
          {t('form.addField')}
        </button>
      </div>

      {/* Items table */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{labels.item}s</h3>

        {/* Desktop table header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 mb-2 px-1">
          <span className="col-span-5 text-xs font-medium text-text-secondary uppercase">
            {labels.item}
          </span>
          <span className="col-span-2 text-xs font-medium text-text-secondary uppercase">
            {labels.quantity}
          </span>
          <span className="col-span-2 text-xs font-medium text-text-secondary uppercase">
            {labels.price}
          </span>
          <span className="col-span-2 text-xs font-medium text-text-secondary uppercase text-right">
            {labels.amount}
          </span>
          <span className="col-span-1" />
        </div>

        {state.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 items-center"
          >
            <div className="sm:col-span-5">
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ITEM',
                    id: item.id,
                    field: 'description',
                    value: e.target.value,
                  })
                }
                placeholder={t('form.description')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ITEM',
                    id: item.id,
                    field: 'quantity',
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ITEM',
                    id: item.id,
                    field: 'unitPrice',
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2 text-right text-sm font-medium px-3 py-2">
              {formatCurrency(item.amount, sym)}
            </div>
            <div className="sm:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                disabled={state.items.length <= 1}
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={t('action.delete')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_ITEM' })}
          className="mt-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
        >
          {t('form.addItem')}
        </button>
      </div>

      {/* Totals section */}
      <div className="border-t border-border pt-6 mt-6">
        <div className="max-w-xs ml-auto space-y-3">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{labels.subtotal}</span>
            <span className="font-medium">{formatCurrency(subtotal, sym)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">{labels.discount}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={state.discountRate}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'discountRate',
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-16 px-2 py-1 border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-text-secondary">%</span>
            </div>
            <span className="font-medium text-danger">
              {discountAmount > 0 ? `-${formatCurrency(discountAmount, sym)}` : formatCurrency(0, sym)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between text-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">{labels.tax}</span>
              <input
                type="number"
                min={0}
                value={state.taxRate}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'taxRate',
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-16 px-2 py-1 border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="text-text-secondary">%</span>
            </div>
            <span className="font-medium">{formatCurrency(taxAmount, sym)}</span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-text-secondary">{t('form.shipping')}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={state.shippingAmount}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'shippingAmount',
                  value: parseFloat(e.target.value) || 0,
                })
              }
              className="w-24 px-2 py-1 border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold">{labels.total}</span>
            <span className="font-bold text-lg">{formatCurrency(total, sym)}</span>
          </div>

          {/* Amount Paid */}
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-text-secondary">{t('form.amountPaid')}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={state.amountPaid}
              onChange={(e) =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'amountPaid',
                  value: parseFloat(e.target.value) || 0,
                })
              }
              className="w-24 px-2 py-1 border border-border rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Balance Due */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold">{t('form.balanceDue')}</span>
            <span
              className={`font-bold text-lg ${balanceDue > 0 ? 'text-danger' : 'text-success'}`}
            >
              {formatCurrency(balanceDue, sym)}
            </span>
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{labels.bankInfo}</h3>

        {state.bankFields.map((field) => (
          <div key={field.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2 items-end">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_BANK_FIELD',
                    id: field.id,
                    field: 'label',
                    value: e.target.value,
                  })
                }
                placeholder={t('form.bankPlaceholder')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                value={field.value}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_BANK_FIELD',
                    id: field.id,
                    field: 'value',
                    value: e.target.value,
                  })
                }
                placeholder={t('form.value')}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="sm:col-span-1 flex">
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'REMOVE_BANK_FIELD', id: field.id })
                }
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title={t('action.delete')}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_BANK_FIELD' })}
          className="mt-2 text-sm text-primary font-medium hover:text-primary-dark transition-colors"
        >
          {t('form.addBankField')}
        </button>
      </div>

      {/* Notes & Terms */}
      <div className="border-t border-border pt-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {labels.notes}
            </label>
            <textarea
              rows={4}
              value={state.notes}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })
              }
              placeholder={t('form.notesPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              {t('form.terms')}
            </label>
            <textarea
              rows={4}
              value={state.terms}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'terms', value: e.target.value })
              }
              placeholder={t('form.termsPlaceholder')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      {/* Firma / Sello */}
      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('form.signature')}</h3>
        <SignaturePad
          value={state.signatureUrl}
          onChange={(url) => dispatch({ type: 'SET_FIELD', field: 'signatureUrl', value: url })}
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.signatureLabel')}</label>
          <input
            type="text"
            value={state.signatureLabel}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'signatureLabel', value: e.target.value })}
            placeholder={t('form.signaturePlaceholder')}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
