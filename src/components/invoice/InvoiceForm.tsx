'use client'

import { Dispatch } from 'react'
import {
  InvoiceState,
  CURRENCIES,
  LANGUAGES,
  Currency,
  Language,
} from '@/types/invoice'

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
  const labels = state.language.labels
  const sym = state.currency.symbol

  return (
    <div className="space-y-6">
      {/* Header row: Title, Currency, Language */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Título
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
            Moneda
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
            Idioma
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
              Logo
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-text-secondary text-sm cursor-pointer hover:border-primary/40 transition-colors">
              {state.logoUrl ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-success">Logo cargado</span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'SET_FIELD', field: 'logoUrl', value: '' })
                    }
                    className="text-danger text-xs underline"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span>Arrastra tu logo aquí o haz clic para subir</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Nombre / Empresa
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
              Email
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
              Dirección
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
                Teléfono
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
                NIF / CIF
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
              Nombre / Empresa
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
              Email
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
              Dirección
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
                Teléfono
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
                NIF / CIF
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
            Incluir dirección de envío
          </span>
        </label>
        {state.showShipping && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Nombre
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
                Dirección
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
        <h3 className="text-lg font-semibold mb-4">Detalles</h3>
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
                Etiqueta
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
                placeholder="Nombre del campo"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Valor
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
                <option value="text">Texto</option>
                <option value="date">Fecha</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'REMOVE_CUSTOM_FIELD', id: field.id })
                }
                className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Eliminar campo"
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
          + Añadir campo
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
                placeholder="Descripción"
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
                title="Eliminar línea"
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
          + Añadir línea
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
            <span className="text-text-secondary">Envío</span>
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
            <span className="text-text-secondary">Pagado</span>
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
            <span className="font-bold">Saldo pendiente</span>
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
                placeholder="Ej: IBAN, BIC, Banco..."
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
                placeholder="Valor"
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
                title="Eliminar campo"
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
          + Añadir campo bancario
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
              placeholder="Notas adicionales para el cliente..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Términos y condiciones
            </label>
            <textarea
              rows={4}
              value={state.terms}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'terms', value: e.target.value })
              }
              placeholder="Términos y condiciones..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
