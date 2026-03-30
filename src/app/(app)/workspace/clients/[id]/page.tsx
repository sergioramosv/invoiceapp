'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n'
import { getClient, getInvoices } from '@/lib/firestore'
import type { Client, Invoice } from '@/types'
import styles from './clientHistory.module.css'

export default function ClientHistoryPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [c, allInvoices] = await Promise.all([
        getClient(clientId),
        getInvoices(user.uid),
      ])
      setClient(c)
      if (c) {
        const clientInvoices = allInvoices.filter(
          (inv) =>
            (inv.billToName && inv.billToName.toLowerCase() === c.name.toLowerCase()) ||
            (inv.billToTaxId && c.taxId && inv.billToTaxId.toLowerCase() === c.taxId.toLowerCase())
        )
        setInvoices(clientInvoices)
      }
    } catch (err) {
      console.error('Error loading client history:', err)
    } finally {
      setLoading(false)
    }
  }, [user, clientId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className={styles.container}>
        <p>{t('clients.empty')}</p>
      </div>
    )
  }

  const totalInvoiced = invoices
    .filter((inv) => inv.documentType !== 'quote')
    .reduce((sum, inv) => sum + (inv.total || 0), 0)
  const invoiceCount = invoices.filter((inv) => inv.documentType !== 'quote').length
  const quoteCount = invoices.filter((inv) => inv.documentType === 'quote').length

  function formatCurrency(value: number): string {
    return value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-surface-tertiary text-text-secondary',
    sent: 'bg-primary/10 text-primary',
    paid: 'bg-success/10 text-success',
    overdue: 'bg-danger/10 text-danger',
    cancelled: 'bg-surface-tertiary text-text-secondary',
  }

  return (
    <div className={styles.container}>
      <Link href="/workspace/clients" className={styles.backLink}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('clients.title')}
      </Link>

      <div className={styles.clientCard}>
        <h1>{client.name}</h1>
        <div className={styles.clientInfo}>
          {client.email && (
            <span className={styles.clientInfoItem}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {client.email}
            </span>
          )}
          {client.phone && (
            <span className={styles.clientInfoItem}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              {client.phone}
            </span>
          )}
          {client.taxId && (
            <span className={styles.clientInfoItem}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm-3.375 3.375h3.75" />
              </svg>
              {client.taxId}
            </span>
          )}
          {client.address && (
            <span className={styles.clientInfoItem}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {client.address}
            </span>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <p>{t('clients.totalInvoiced')}</p>
          <h3>{formatCurrency(totalInvoiced)}</h3>
        </div>
        <div className={styles.statCard}>
          <p>{t('workspace.invoiceCount')}</p>
          <h3>{invoiceCount}</h3>
        </div>
        <div className={styles.statCard}>
          <p>{t('workspace.quoteCount')}</p>
          <h3>{quoteCount}</h3>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('workspace.noDocuments')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('table.type')}</th>
                <th>{t('table.number')}</th>
                <th>{t('table.date')}</th>
                <th>{t('table.total')}</th>
                <th>{t('table.status')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.documentType === 'quote' ? t('docType.quote') : t('docType.invoice')}</td>
                  <td>
                    <Link href={`/workspace/edit?id=${inv.id}`} className={styles.invoiceLink}>
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td>{inv.issueDate}</td>
                  <td>{formatCurrency(inv.total)}</td>
                  <td>
                    <span className={`${styles.badge} ${statusColors[inv.status] || ''}`}>
                      {t(`status.${inv.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
