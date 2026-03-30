'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { useI18n } from '@/lib/i18n'

interface SendEmailModalProps {
  open: boolean
  onClose: () => void
  onSend: (data: { recipientEmail: string; subject: string; message: string }) => Promise<void>
  defaultEmail?: string
  defaultSubject?: string
}

export function SendEmailModal({ open, onClose, onSend, defaultEmail = '', defaultSubject = '' }: SendEmailModalProps) {
  const { t } = useI18n()
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail)
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(t('email.messageDefault'))
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  function handleClose() {
    setResult(null)
    setSending(false)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientEmail) return
    setSending(true)
    setResult(null)
    try {
      await onSend({ recipientEmail, subject, message })
      setResult('success')
      setTimeout(() => handleClose(), 1500)
    } catch {
      setResult('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('email.send')}</h3>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('email.recipient')}
          </label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('email.subject')}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {t('email.message')}
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {result === 'success' && (
          <p className="text-sm text-success font-medium">{t('email.success')}</p>
        )}
        {result === 'error' && (
          <p className="text-sm text-danger font-medium">{t('email.error')}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            {t('modal.cancel')}
          </button>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
          >
            {sending ? t('email.sending') : t('email.send')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
