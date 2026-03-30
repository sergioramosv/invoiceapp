'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { useI18n } from '@/lib/i18n'

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-success shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

export default function UpgradePage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const proFeatures = [
    t('upgrade.feat1'),
    t('upgrade.feat2'),
    t('upgrade.feat3'),
    t('upgrade.feat4'),
    t('upgrade.feat5'),
  ]

  useEffect(() => {
    async function checkPaidStatus() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const db = getFirebaseDb()
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setIsPaid(userDoc.data().isPaid === true)
        }
      } catch {
        // Default to free
      } finally {
        setLoading(false)
      }
    }
    checkPaidStatus()
  }, [user])

  async function handleUpgrade() {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Back link */}
      <Link
        href="/workspace"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-8"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {t('workspace.backToWorkspace')}
      </Link>

      <div className="rounded-2xl border border-success/20 bg-success/10 p-8 text-center">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text mb-2">{t('upgrade.launchTitle')}</h2>
        <p className="text-text-secondary mb-6">{t('upgrade.launchDesc')}</p>
        <ul className="space-y-3 text-left max-w-sm mx-auto">
          {proFeatures.map((feat) => (
            <li key={feat} className="flex items-center gap-3 text-sm text-text">
              <CheckIcon />
              {feat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
