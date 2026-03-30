'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { useAuth } from './auth-context'
import es from '@/lib/dictionaries/es'
import en from '@/lib/dictionaries/en'

type Locale = 'es' | 'en'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [locale, setLocaleState] = useState<Locale>('es')

  // Load locale: from Firestore user doc > localStorage > browser
  useEffect(() => {
    async function loadLocale() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(getFirebaseDb(), 'users', user.uid))
          if (userDoc.exists() && userDoc.data().locale) {
            const saved = userDoc.data().locale as Locale
            setLocaleState(saved)
            document.documentElement.lang = saved
            return
          }
        } catch { /* fallback below */ }
      }

      const saved = localStorage.getItem('locale') as Locale | null
      if (saved && (saved === 'es' || saved === 'en')) {
        setLocaleState(saved)
      } else {
        const browserLang = navigator.language.startsWith('en') ? 'en' : 'es'
        setLocaleState(browserLang)
      }
    }
    loadLocale()
  }, [user])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
    document.documentElement.lang = l

    // Save to Firestore if user is logged in
    if (user) {
      setDoc(doc(getFirebaseDb(), 'users', user.uid), { locale: l }, { merge: true }).catch(() => {})
    }
  }, [user])

  const t = useCallback((key: string): string => {
    const dict = locale === 'en' ? en : es
    return dict[key] || key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export type { Locale }
