'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md animate-in">
        {children}
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, danger = false }: ConfirmModalProps) {
  const { t } = useI18n()
  const resolvedConfirmLabel = confirmLabel || t('modal.confirm')

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-text-secondary text-sm">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              danger
                ? 'bg-danger text-white hover:bg-danger/90'
                : 'bg-text text-surface hover:bg-text-secondary'
            }`}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface PromptModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (value: string) => void
  title: string
  placeholder?: string
  submitLabel?: string
}

export function PromptModal({ open, onClose, onSubmit, title, placeholder = '', submitLabel }: PromptModalProps) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const resolvedSubmitLabel = submitLabel || t('modal.save')

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  return (
    <Modal open={open} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const val = inputRef.current?.value.trim()
          if (val) { onSubmit(val); onClose() }
        }}
        className="p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            {t('modal.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            {resolvedSubmitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}
