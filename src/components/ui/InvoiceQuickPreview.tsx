'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { firestoreToInvoiceState } from '@/lib/invoice-converter'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import {
  getSubtotal,
  getDiscountAmount,
  getTaxAmount,
  getTotal,
  getBalanceDue,
} from '@/types/invoice'
import type { Invoice } from '@/types'
import styles from './InvoiceQuickPreview.module.css'

interface Props {
  invoice: Invoice
  mouseX: number
  mouseY: number
}

export default function InvoiceQuickPreview({ invoice, mouseX, mouseY }: Props) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const state = firestoreToInvoiceState(invoice)

  // Position: prefer right of cursor, flip to left if near right edge
  const previewWidth = 320
  const previewHeight = 440
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let left = mouseX + 16
  let top = mouseY - 40

  if (left + previewWidth > windowWidth - 16) {
    left = mouseX - previewWidth - 16
  }

  if (top + previewHeight > windowHeight - 16) {
    top = windowHeight - previewHeight - 16
  }

  if (top < 16) top = 16

  return createPortal(
    <div
      ref={containerRef}
      className={styles.container}
      style={{ left: `${left}px`, top: `${top}px` }}
    >
      <div className={styles.previewWrapper}>
        <div className={styles.previewScale}>
          <InvoicePreview
            state={state}
            subtotal={getSubtotal(state)}
            discountAmount={getDiscountAmount(state)}
            taxAmount={getTaxAmount(state)}
            total={getTotal(state)}
            balanceDue={getBalanceDue(state)}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
