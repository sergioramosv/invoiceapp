'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function DemoTemplatesPage() {
  const { t } = useI18n()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('templates.title')}</h1>
          <p className="text-text-secondary mt-1">{t('templates.subtitle')}</p>
        </div>
        <Link href="/demo/new" className="px-6 py-2 text-sm bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
          {t('templates.create')}
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-tertiary rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">{t('templates.empty')}</h3>
        <p className="text-text-secondary mt-1">{t('templates.emptyDesc')}</p>
        <Link href="/demo/new" className="mt-6 inline-block px-8 py-3 bg-text text-surface rounded-lg font-medium hover:bg-text-secondary transition-colors">
          {t('templates.createFirst')}
        </Link>
      </div>
    </div>
  )
}
