'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { getTemplates, deleteTemplate } from '@/lib/firestore'
import type { Template } from '@/types'

export default function TemplatesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)

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

  async function handleDelete(id: string) {
    if (!window.confirm('Eliminar este template?')) return
    try {
      await deleteTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Error deleting template:', err)
    }
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
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-text-secondary mt-1">
            Plantillas guardadas para reutilizar
          </p>
        </div>
        <Link
          href="/workspace/new"
          className="px-6 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          + Nueva factura
        </Link>
      </div>

      {loadingTemplates ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-tertiary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No tienes templates todavia</h3>
          <p className="text-text-secondary mt-1">
            Crea una factura y guardala como template para reutilizarla
          </p>
          <Link
            href="/workspace/new"
            className="mt-6 inline-block px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Crear factura
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
                  Creado: {template.createdAt
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
                  className="flex-1 px-3 py-2 text-sm text-center bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Usar template
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                  title="Eliminar"
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
    </div>
  )
}
