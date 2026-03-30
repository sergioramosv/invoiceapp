'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-surface-secondary">
      <nav className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between">
        <Link href="/workspace" className="font-bold text-lg text-primary">
          InvoiceApp
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
              {(user.displayName || user.email || '?')[0].toUpperCase()}
            </div>
          </div>
        )}
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
