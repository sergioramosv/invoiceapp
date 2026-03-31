'use client'

import { useReducer, useMemo } from 'react'
import { uid } from '@/lib/uid'
import {
  InvoiceState,
  Currency,
  Language,
  VatLine,
  createInitialState,
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
  getVatBreakdown,
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
  | { type: 'ADD_VAT_LINE'; rate: number }
  | { type: 'REMOVE_VAT_LINE'; id: string }
  | { type: 'UPDATE_VAT_LINE'; id: string; rate: number }
  | { type: 'ADD_SIGNATURE' }
  | { type: 'UPDATE_SIGNATURE'; id: string; field: 'url' | 'label'; value: string }
  | { type: 'REMOVE_SIGNATURE'; id: string }

function invoiceReducer(state: InvoiceState, action: InvoiceAction): InvoiceState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_CURRENCY':
      return { ...state, currency: action.currency }

    case 'SET_LANGUAGE':
      return { ...state, language: action.language }

    case 'ADD_ITEM':
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: uid(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0,
            vatLineId: state.vatLines[0]?.id || 'vat-21',
          },
        ],
      }

    case 'UPDATE_ITEM': {
      const items = state.items.map((item) => {
        if (item.id !== action.id) return item
        const updated = { ...item, [action.field]: action.value }
        if (action.field === 'quantity' || action.field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice
        }
        return updated
      })
      return { ...state, items }
    }

    case 'REMOVE_ITEM':
      if (state.items.length <= 1) return state
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }

    case 'ADD_CUSTOM_FIELD':
      return {
        ...state,
        customFields: [
          ...state.customFields,
          { id: uid(), label: '', type: 'text', value: '' },
        ],
      }

    case 'UPDATE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.map((f) =>
          f.id === action.id ? { ...f, [action.field]: action.value } : f
        ),
      }

    case 'REMOVE_CUSTOM_FIELD':
      return {
        ...state,
        customFields: state.customFields.filter((f) => f.id !== action.id),
      }

    case 'ADD_BANK_FIELD':
      return {
        ...state,
        bankFields: [
          ...state.bankFields,
          { id: uid(), label: '', value: '' },
        ],
      }

    case 'UPDATE_BANK_FIELD':
      return {
        ...state,
        bankFields: state.bankFields.map((f) =>
          f.id === action.id ? { ...f, [action.field]: action.value } : f
        ),
      }

    case 'REMOVE_BANK_FIELD':
      return {
        ...state,
        bankFields: state.bankFields.filter((f) => f.id !== action.id),
      }

    case 'TOGGLE_SHIPPING':
      return { ...state, showShipping: !state.showShipping }

    case 'ADD_VAT_LINE': {
      const newLine: VatLine = {
        id: uid(),
        rate: action.rate,
        label: action.rate === 0 ? 'Exento' : `IVA ${action.rate}%`,
      }
      return { ...state, vatLines: [...state.vatLines, newLine] }
    }

    case 'REMOVE_VAT_LINE': {
      if (state.vatLines.length <= 1) return state
      const remaining = state.vatLines.filter((v) => v.id !== action.id)
      const fallbackId = remaining[0].id
      // Reassign items that used the removed VAT line
      const updatedItems = state.items.map((item) =>
        item.vatLineId === action.id ? { ...item, vatLineId: fallbackId } : item
      )
      return { ...state, vatLines: remaining, items: updatedItems }
    }

    case 'UPDATE_VAT_LINE':
      return {
        ...state,
        vatLines: state.vatLines.map((v) =>
          v.id === action.id
            ? { ...v, rate: action.rate, label: action.rate === 0 ? 'Exento' : `IVA ${action.rate}%` }
            : v
        ),
      }

    case 'ADD_SIGNATURE':
      return {
        ...state,
        signatures: [...state.signatures, { id: uid(), url: '', label: '' }],
      }

    case 'UPDATE_SIGNATURE':
      return {
        ...state,
        signatures: state.signatures.map((s) =>
          s.id === action.id ? { ...s, [action.field]: action.value } : s
        ),
      }

    case 'REMOVE_SIGNATURE':
      return {
        ...state,
        signatures: state.signatures.filter((s) => s.id !== action.id),
      }

    default:
      return state
  }
}

export function useInvoice(initialState?: InvoiceState) {
  const [state, dispatch] = useReducer(
    invoiceReducer,
    initialState || createInitialState()
  )

  const computed = useMemo(
    () => ({
      subtotal: getSubtotal(state),
      discountAmount: getDiscountAmount(state),
      taxAmount: getTaxAmount(state),
      total: getTotal(state),
      balanceDue: getBalanceDue(state),
      vatBreakdown: getVatBreakdown(state),
    }),
    [state]
  )

  return {
    state,
    dispatch,
    ...computed,
  }
}
