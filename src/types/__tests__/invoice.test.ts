import { describe, it, expect } from 'vitest'
import {
  createInitialState,
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
} from '../invoice'

describe('Invoice calculations', () => {
  it('should create initial state with defaults', () => {
    const state = createInitialState()
    expect(state.title).toBe('Factura')
    expect(state.currency.code).toBe('EUR')
    expect(state.language.code).toBe('es')
    expect(state.items).toHaveLength(1)
    expect(state.documentType).toBe('invoice')
    expect(state.templateStyle).toBe('default')
  })

  it('should calculate subtotal from items', () => {
    const state = createInitialState()
    state.items = [
      { id: '1', description: 'Item 1', quantity: 2, unitPrice: 100, amount: 200 },
      { id: '2', description: 'Item 2', quantity: 1, unitPrice: 500, amount: 500 },
    ]
    expect(getSubtotal(state)).toBe(700)
  })

  it('should calculate discount amount', () => {
    const state = createInitialState()
    state.items = [{ id: '1', description: 'Test', quantity: 1, unitPrice: 1000, amount: 1000 }]
    state.discountRate = 10
    expect(getDiscountAmount(state)).toBe(100)
  })

  it('should calculate tax on discounted subtotal', () => {
    const state = createInitialState()
    state.items = [{ id: '1', description: 'Test', quantity: 1, unitPrice: 1000, amount: 1000 }]
    state.discountRate = 10 // discount = 100, taxable = 900
    state.taxRate = 21
    expect(getTaxAmount(state)).toBe(189) // 900 * 0.21
  })

  it('should calculate total correctly', () => {
    const state = createInitialState()
    state.items = [{ id: '1', description: 'Test', quantity: 1, unitPrice: 1000, amount: 1000 }]
    state.discountRate = 0
    state.taxRate = 21
    state.shippingAmount = 10
    // 1000 + 210 + 10 = 1220
    expect(getTotal(state)).toBe(1220)
  })

  it('should calculate balance due', () => {
    const state = createInitialState()
    state.items = [{ id: '1', description: 'Test', quantity: 1, unitPrice: 1000, amount: 1000 }]
    state.taxRate = 0
    state.discountRate = 0
    state.shippingAmount = 0
    state.amountPaid = 400
    expect(getBalanceDue(state)).toBe(600)
  })

  it('should handle zero items', () => {
    const state = createInitialState()
    state.items = []
    expect(getSubtotal(state)).toBe(0)
    expect(getTotal(state)).toBe(0)
  })
})
