'use client'

import { useState } from 'react'
import { useDemo } from '@/lib/demo-context'
import { useI18n } from '@/lib/i18n'
import { Modal } from '@/components/ui/Modal'
import type { Client } from '@/types'

export default function DemoClientsPage() {
  const { clients, addClient, updateClient } = useDemo()
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.taxId || '').toLowerCase().includes(q)
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

  function handleSaveClient(data: { name: string; email: string; address: string; phone: string; taxId: string }) {
    if (editingClient) {
      updateClient(editingClient.id, data)
    } else {
      addClient(data)
    }
    setModalOpen(false)
    setEditingClient(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('nav.clients') || 'Clientes'}</h1>
          <p className="text-text-secondary mt-1">{clients.length} {(t('nav.clients') || 'clientes').toLowerCase()}</p>
        </div>
        <button
          onClick={handleNew}
          className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
        >
          {t('clients.new') || 'Nuevo cliente'}
        </button>
      </div>

      <div className="relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('clients.search') || 'Buscar clientes...'}
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('form.name') || 'Nombre'}</th>
              <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs hidden sm:table-cell">{t('form.email') || 'Email'}</th>
              <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs hidden md:table-cell">{t('form.taxId') || 'NIF/CIF'}</th>
              <th className="text-left py-2.5 px-4 font-semibold text-text-secondary text-xs hidden lg:table-cell">{t('form.phone') || 'Telefono'}</th>
              <th className="text-right py-2.5 px-4 font-semibold text-text-secondary text-xs">{t('table.actions') || 'Acciones'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-text-muted">{t('workspace.noResults') || 'Sin resultados'}</td></tr>
            ) : filtered.map(client => (
              <tr key={client.id} className="border-b border-border last:border-0 hover:bg-surface-secondary transition-colors">
                <td className="py-3 px-4 font-medium">{client.name}</td>
                <td className="py-3 px-4 text-text-secondary hidden sm:table-cell">{client.email || '---'}</td>
                <td className="py-3 px-4 text-text-secondary hidden md:table-cell">{client.taxId || '---'}</td>
                <td className="py-3 px-4 text-text-secondary hidden lg:table-cell">{client.phone || '---'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(client)} className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button disabled className="p-1.5 text-text-muted/30 cursor-not-allowed rounded-lg" title={t('demo.noDelete') || 'No disponible en demo'}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingClient(null) }}>
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => { setModalOpen(false); setEditingClient(null) }}
        />
      </Modal>
    </div>
  )
}

function ClientForm({ client, onSave, onCancel }: {
  client: Client | null
  onSave: (data: { name: string; email: string; address: string; phone: string; taxId: string }) => void
  onCancel: () => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [address, setAddress] = useState(client?.address || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [taxId, setTaxId] = useState(client?.taxId || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), email, address, phone, taxId })
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">{client ? (t('clients.edit') || 'Editar cliente') : (t('clients.new') || 'Nuevo cliente')}</h3>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.name') || 'Nombre'} *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.email') || 'Email'}</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.address') || 'Direccion'}</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.phone') || 'Telefono'}</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('form.taxId') || 'NIF/CIF'}</label>
          <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors">
          {t('modal.cancel') || 'Cancelar'}
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
          {t('modal.save') || 'Guardar'}
        </button>
      </div>
    </form>
  )
}
