'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { getTemplates, deleteTemplate } from '@/lib/firestore'
import type { Template } from '@/types'
import { ConfirmModal } from '@/components/ui/Modal'
import { useI18n } from '@/lib/i18n'
import { Skeleton } from '@/components/ui/Skeleton'

export default function TemplatesPage() {
  const { user, loading } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    if (!user) return
    try {
      const data = await getTemplates(user.uid)
      setTemplates(data)
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoadingTemplates(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchTemplates()
  }, [user, fetchTemplates])

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteTemplate(deleteTarget)
      setTemplates((prev) => prev.filter((tmpl) => tmpl.id !== deleteTarget))
    } catch (err) {
      console.error('Error deleting template:', err)
    }
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('templates.title')}</h1>
          <p className="text-text-secondary mt-1">
            {t('templates.subtitle')}
          </p>
        </div>
        <Link
          href="/workspace/new?saveAsTemplate=true"
          className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
        >
          {t('templates.create')}
        </Link>
      </div>

      {loadingTemplates ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-tertiary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">{t('templates.empty')}</h3>
          <p className="text-text-secondary mt-1">
            {t('templates.emptyDesc')}
          </p>
          <Link
            href="/workspace/new?saveAsTemplate=true"
            className="mt-6 inline-block px-8 py-3 bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors"
          >
            {t('templates.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-base">{template.name}</h3>
                <p className="text-text-secondary text-sm mt-1">
                  {t('templates.created')}: {template.createdAt
                    ? new Date(
                        typeof template.createdAt === 'object'
                          ? (template.createdAt as { seconds: number }).seconds * 1000
                          : template.createdAt
                      ).toLocaleDateString('es-ES')
                    : '---'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Link
                  href={`/workspace/new?template=${template.id}`}
                  className="flex-1 px-3 py-2 text-sm text-center border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors"
                >
                  {t('templates.use')}
                </Link>
                <button
                  onClick={() => setDeleteTarget(template.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  title={t('action.delete')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('modal.deleteTemplate')}
        message={t('modal.deleteTemplateMsg')}
        confirmLabel={t('modal.deleteBtn')}
        danger
      />
    </div>
  )
}
