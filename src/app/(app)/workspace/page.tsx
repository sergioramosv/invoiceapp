'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WorkspacePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Facturas</h1>
          <p className="text-text-secondary mt-1">Hola, {user.displayName || user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => signOut().then(() => router.push('/'))}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-surface-tertiary transition-colors"
          >
            Cerrar sesión
          </button>
          <button className="px-6 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
            + Nueva factura
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h3 className="text-lg font-medium">No tienes facturas todavía</h3>
        <p className="text-text-secondary mt-1">Crea tu primera factura profesional en segundos</p>
        <button className="mt-6 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Crear primera factura
        </button>
      </div>
    </div>
  )
}
