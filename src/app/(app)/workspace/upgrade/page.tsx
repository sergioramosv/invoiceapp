'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'

const proFeatures = [
  'Sin watermark en PDFs',
  'Templates ilimitados',
  'Export PDF + PNG',
  'Soporte prioritario',
  'Actualizaciones de por vida',
]

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
  const [isPaid, setIsPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

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
    <div className="max-w-2xl mx-auto p-6">
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
        Volver al workspace
      </Link>

      {/* Current plan badge */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Tu plan</h1>
        <div className="inline-flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isPaid
                ? 'bg-success/10 text-success'
                : 'bg-text/10 text-text-secondary'
            }`}
          >
            {isPaid ? 'Pro — Lifetime' : 'Plan Gratuito'}
          </span>
        </div>
      </div>

      {isPaid ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 p-8 text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-success"
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
          </div>
          <h2 className="text-xl font-bold text-text mb-2">
            Ya tienes el plan Pro
          </h2>
          <p className="text-text-secondary">
            Disfruta de todas las funcionalidades sin limitaciones.
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl border-2 border-primary bg-surface p-8 shadow-xl shadow-primary/10">
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 bg-text text-surface text-xs font-semibold rounded-full">
              Pro — Lifetime
            </span>
          </div>

          <div className="text-center mt-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-text">29&euro;</span>
              <span className="text-text-muted line-through">49&euro;</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">pago unico</p>
          </div>

          <ul className="mt-8 space-y-4">
            {proFeatures.map((feat) => (
              <li
                key={feat}
                className="flex items-center gap-3 text-sm text-text"
              >
                <CheckIcon />
                {feat}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={checkoutLoading}
            className="mt-8 block w-full py-3.5 bg-text text-surface rounded-xl font-medium hover:bg-text-secondary transition-colors text-center shadow-lg shadow-text/25 disabled:opacity-50"
          >
            {checkoutLoading ? 'Redirigiendo a Stripe...' : 'Upgrade a Pro'}
          </button>

          <p className="text-center mt-4 text-xs text-text-muted">
            Pago seguro con Stripe. Se aceptan codigos de descuento.
          </p>
        </div>
      )}
    </div>
  )
}
