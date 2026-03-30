import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInvoice } from '../useInvoice'
import { createInitialState } from '@/types/invoice'

describe('useInvoice hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useInvoice())
    expect(result.current.state.title).toBe('Factura')
    expect(result.current.subtotal).toBe(0)
  })

  it('should update a field', () => {
    const { result } = renderHook(() => useInvoice())
    act(() => {
      result.current.dispatch({ type: 'SET_FIELD', field: 'title', value: 'Presupuesto' })
    })
    expect(result.current.state.title).toBe('Presupuesto')
  })

  it('should add and remove items', () => {
    const { result } = renderHook(() => useInvoice())
    const initialCount = result.current.state.items.length
    act(() => {
      result.current.dispatch({ type: 'ADD_ITEM' })
    })
    expect(result.current.state.items.length).toBe(initialCount + 1)

    const lastId = result.current.state.items[result.current.state.items.length - 1].id
    act(() => {
      result.current.dispatch({ type: 'REMOVE_ITEM', id: lastId })
    })
    expect(result.current.state.items.length).toBe(initialCount)
  })

  it('should update item and recalculate amount', () => {
    const { result } = renderHook(() => useInvoice())
    const itemId = result.current.state.items[0].id
    act(() => {
      result.current.dispatch({ type: 'UPDATE_ITEM', id: itemId, field: 'quantity', value: 5 })
      result.current.dispatch({ type: 'UPDATE_ITEM', id: itemId, field: 'unitPrice', value: 100 })
    })
    const item = result.current.state.items.find(i => i.id === itemId)
    expect(item?.amount).toBe(500)
  })

  it('should toggle shipping', () => {
    const { result } = renderHook(() => useInvoice())
    expect(result.current.state.showShipping).toBe(false)
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SHIPPING' })
    })
    expect(result.current.state.showShipping).toBe(true)
  })

  it('should add and remove custom fields', () => {
    const { result } = renderHook(() => useInvoice())
    act(() => {
      result.current.dispatch({ type: 'ADD_CUSTOM_FIELD' })
    })
    expect(result.current.state.customFields.length).toBe(1)

    const fieldId = result.current.state.customFields[0].id
    act(() => {
      result.current.dispatch({ type: 'REMOVE_CUSTOM_FIELD', id: fieldId })
    })
    expect(result.current.state.customFields.length).toBe(0)
  })

  it('should add and remove bank fields', () => {
    const { result } = renderHook(() => useInvoice())
    act(() => {
      result.current.dispatch({ type: 'ADD_BANK_FIELD' })
    })
    expect(result.current.state.bankFields.length).toBe(1)

    const fieldId = result.current.state.bankFields[0].id
    act(() => {
      result.current.dispatch({ type: 'REMOVE_BANK_FIELD', id: fieldId })
    })
    expect(result.current.state.bankFields.length).toBe(0)
  })

  it('should accept initial state', () => {
    const { result } = renderHook(() => useInvoice({
      ...createInitialState(),
      title: 'Custom Title',
    }))
    expect(result.current.state.title).toBe('Custom Title')
  })
})
