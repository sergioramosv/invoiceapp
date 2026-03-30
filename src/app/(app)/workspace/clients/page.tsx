'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n'
import { getClients, createClient, updateClient, deleteClient } from '@/lib/firestore'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import type { Client } from '@/types'
import styles from './clients.module.css'

export default function ClientsPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const loadClients = useCallback(async () => {
    if (!user) return
    try {
      const data = await getClients(user.uid)
      setClients(data)
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.taxId || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    )
  })

  function handleEdit(client: Client) {
    setEditingClient(client)
    setModalOpen(true)
  }

  function handleNew() {
    setEditingClient(null)
    setModalOpen(true)
  }

  async function handleSaveClient(data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    if (!user) return
    if (editingClient) {
      await updateClient(editingClient.id, data)
    } else {
      await createClient({ ...data, userId: user.uid })
    }
    setModalOpen(false)
    setEditingClient(null)
    await loadClients()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteClient(deleteTarget.id)
    setDeleteTarget(null)
    await loadClients()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('clients.title')}</h1>
          <p>{t('clients.subtitle')}</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('clients.search')}
          className={styles.searchInput}
        />
        <button onClick={handleNew} className={styles.newBtn}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t('clients.new')}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg className="w-12 h-12 mx-auto mb-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <h3>{t('clients.empty')}</h3>
          <p>{t('clients.subtitle')}</p>
          <button onClick={handleNew} className={styles.newBtn}>
            {t('clients.new')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('form.name')}</th>
                <th>{t('form.email')}</th>
                <th>{t('form.taxId')}</th>
                <th>{t('form.phone')}</th>
                <th>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td>
                    <Link href={`/workspace/clients/${client.id}`} className={styles.clientNameLink}>
                      {client.name}
                    </Link>
                  </td>
                  <td>{client.email || '—'}</td>
                  <td>{client.taxId || '—'}</td>
                  <td>{client.phone || '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(client)}
                        className={styles.actionBtn}
                        title={t('action.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(client)}
                        className={styles.dangerBtn}
                        title={t('action.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingClient(null) }}
        onSave={handleSaveClient}
        client={editingClient}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('modal.deleteDocument')}
        message={t('modal.deleteDocumentMsg')}
        confirmLabel={t('modal.deleteBtn')}
        danger
      />
    </div>
  )
}

function ClientFormModal({
  open,
  onClose,
  onSave,
  client,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  client: Client | null
}) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [taxId, setTaxId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(client?.name || '')
      setEmail(client?.email || '')
      setAddress(client?.address || '')
      setPhone(client?.phone || '')
      setTaxId(client?.taxId || '')
    }
  }, [open, client])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), email, address, phone, taxId })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">
          {client ? t('clients.edit') : t('clients.new')}
        </h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroupFull}>
            <label className={styles.formLabel}>{t('form.name')} *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('form.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('form.phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('form.taxId')}</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('form.address')}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.formInput}
            />
          </div>
        </div>
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
            disabled={saving}
            className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
          >
            {saving ? t('editor.saving') : t('modal.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
