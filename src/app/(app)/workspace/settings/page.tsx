'use client'

import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/auth-context'
import { getFirebaseDb } from '@/lib/firebase'
import { useI18n } from '@/lib/i18n'
import styles from './settings.module.css'

interface NumberingConfig {
  invoicePrefix: string
  quotePrefix: string
  includeYear: boolean
  separator: string
  resetYearly: boolean
}

const DEFAULT_NUMBERING: NumberingConfig = {
  invoicePrefix: 'FAC',
  quotePrefix: 'PRES',
  includeYear: true,
  separator: '-',
  resetYearly: true,
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { t } = useI18n()

  // API Key state
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Numbering state
  const [numbering, setNumbering] = useState<NumberingConfig>(DEFAULT_NUMBERING)
  const [numberingSaved, setNumberingSaved] = useState(false)
  const [nextNumber, setNextNumber] = useState('')

  // Load user settings
  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const db = getFirebaseDb()
        const userDoc = await getDoc(doc(db, 'users', user!.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.apiKey) setApiKey(data.apiKey)
          if (data.numberingConfig) {
            setNumbering({ ...DEFAULT_NUMBERING, ...data.numberingConfig })
          }
        }
      } catch {
        // silently fail
      }
    }
    load()
  }, [user])

  // Compute next number preview
  const computeNextNumber = useCallback((config: NumberingConfig) => {
    const year = new Date().getFullYear()
    const num = '001'
    const parts = [config.invoicePrefix]
    if (config.includeYear) parts.push(String(year))
    parts.push(num)
    return parts.join(config.separator)
  }, [])

  useEffect(() => {
    setNextNumber(computeNextNumber(numbering))
  }, [numbering, computeNextNumber])

  async function generateApiKey() {
    if (!user) return
    setGenerating(true)
    try {
      const key = `ia_${crypto.randomUUID().replace(/-/g, '')}`
      const db = getFirebaseDb()
      await setDoc(doc(db, 'users', user.uid), { apiKey: key }, { merge: true })
      setApiKey(key)
    } catch {
      // silently fail
    } finally {
      setGenerating(false)
    }
  }

  async function copyApiKey() {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently fail
    }
  }

  async function saveNumberingConfig(config: NumberingConfig) {
    if (!user) return
    try {
      const db = getFirebaseDb()
      await setDoc(doc(db, 'users', user.uid), { numberingConfig: config }, { merge: true })
      setNumberingSaved(true)
      setTimeout(() => setNumberingSaved(false), 2000)
    } catch {
      // silently fail
    }
  }

  function updateNumbering(field: keyof NumberingConfig, value: string | boolean) {
    const updated = { ...numbering, [field]: value }
    setNumbering(updated)
    saveNumberingConfig(updated)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('settings.title')}</h1>
      </div>

      {/* API Key Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.apiKey')}</h2>
        <p className={styles.sectionDesc}>{t('settings.apiDocs')}</p>

        {apiKey ? (
          <>
            <div className={styles.apiKeyBox}>
              <input
                type="text"
                value={apiKey}
                readOnly
                className={styles.apiKeyInput}
              />
              <button onClick={copyApiKey} className={styles.btnOutline}>
                {copied ? t('settings.keyCopied') : t('settings.copyKey')}
              </button>
            </div>
            <div className={styles.btnRow}>
              <button onClick={generateApiKey} disabled={generating} className={styles.btnOutline}>
                {t('settings.regenerateKey')}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.btnRow}>
            <button onClick={generateApiKey} disabled={generating} className={styles.btnPrimary}>
              {t('settings.generateKey')}
            </button>
          </div>
        )}

        <div className={styles.docsBlock}>
          <code>{`# ${t('settings.apiDocs')}

# List invoices
curl -H "x-api-key: YOUR_API_KEY" \\
  https://invoiceapp.es/api/v1/invoices

# Create invoice
curl -X POST -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"billToName":"Client","total":100}' \\
  https://invoiceapp.es/api/v1/invoices

# List clients
curl -H "x-api-key: YOUR_API_KEY" \\
  https://invoiceapp.es/api/v1/clients`}</code>
        </div>
      </div>

      {/* Numbering Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t('settings.numbering')}
          {numberingSaved && <span className={styles.savedMsg}>✓</span>}
        </h2>
        <p className={styles.sectionDesc}>{t('settings.numberingDesc')}</p>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('settings.prefix')}</label>
            <input
              type="text"
              value={numbering.invoicePrefix}
              onChange={(e) => updateNumbering('invoicePrefix', e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('settings.quotePrefix')}</label>
            <input
              type="text"
              value={numbering.quotePrefix}
              onChange={(e) => updateNumbering('quotePrefix', e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('settings.separator')}</label>
            <input
              type="text"
              value={numbering.separator}
              onChange={(e) => updateNumbering('separator', e.target.value)}
              className={styles.formInput}
              maxLength={3}
            />
          </div>
        </div>

        <div>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>{t('settings.includeYear')}</span>
            <button
              className={`${styles.toggle} ${numbering.includeYear ? styles.toggleActive : ''}`}
              onClick={() => updateNumbering('includeYear', !numbering.includeYear)}
              type="button"
            >
              <span className={`${styles.toggleDot} ${numbering.includeYear ? styles.toggleDotActive : ''}`} />
            </button>
          </div>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>{t('settings.resetYearly')}</span>
            <button
              className={`${styles.toggle} ${numbering.resetYearly ? styles.toggleActive : ''}`}
              onClick={() => updateNumbering('resetYearly', !numbering.resetYearly)}
              type="button"
            >
              <span className={`${styles.toggleDot} ${numbering.resetYearly ? styles.toggleDotActive : ''}`} />
            </button>
          </div>
        </div>

        <div className={styles.nextNumberPreview}>
          <span className={styles.nextNumberLabel}>{t('settings.nextNumber')}</span>
          <span className={styles.nextNumberValue}>{nextNumber}</span>
        </div>
      </div>
    </div>
  )
}
