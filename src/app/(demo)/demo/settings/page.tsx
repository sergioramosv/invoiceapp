'use client'

import { useState, useEffect, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'

interface NumberingConfig {
  invoicePrefix: string
  quotePrefix: string
  includeYear: boolean
  separator: string
  resetYearly: boolean
}

const DEFAULT_NUMBERING: NumberingConfig = {
  invoicePrefix: 'FAC', quotePrefix: 'PRES', includeYear: true, separator: '-', resetYearly: true,
}

export default function DemoSettingsPage() {
  const { t } = useI18n()
  const [numbering, setNumbering] = useState<NumberingConfig>(DEFAULT_NUMBERING)
  const [numberingSaved, setNumberingSaved] = useState(false)
  const [nextNumber, setNextNumber] = useState('')

  const computeNextNumber = useCallback((config: NumberingConfig) => {
    const year = new Date().getFullYear()
    const parts = [config.invoicePrefix]
    if (config.includeYear) parts.push(String(year))
    parts.push('001')
    return parts.join(config.separator)
  }, [])

  useEffect(() => { setNextNumber(computeNextNumber(numbering)) }, [numbering, computeNextNumber])

  function updateNumbering(field: keyof NumberingConfig, value: string | boolean) {
    const updated = { ...numbering, [field]: value }
    setNumbering(updated)
    setNumberingSaved(true)
    setTimeout(() => setNumberingSaved(false), 2000)
  }

  const inputClass = "w-full px-3 py-2 border border-border rounded-lg bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      {/* API Key Section */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('settings.apiKey')}</h2>
        <p className="text-sm text-text-secondary">{t('settings.apiDocs')}</p>
        <div className="flex gap-2">
          <input type="text" value="ia_demo_xxxxxxxxxxxxxxxxxxxx" readOnly className={`${inputClass} font-mono text-xs flex-1`} />
          <button className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors">
            {t('settings.copyKey')}
          </button>
        </div>
        <div className="p-4 bg-surface-secondary rounded-lg overflow-x-auto">
          <code className="text-xs text-text-secondary whitespace-pre">{`# ${t('settings.apiDocs')}

# List invoices
curl -H "x-api-key: YOUR_API_KEY" \\
  https://invoiceapp.es/api/v1/invoices

# Create invoice
curl -X POST -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"billToName":"Client","total":100}' \\
  https://invoiceapp.es/api/v1/invoices`}</code>
        </div>
      </div>

      {/* VeriFactu Section */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('settings.verifactuTitle')}</h2>
        <p className="text-sm text-text-secondary">{t('settings.verifactuDesc')}</p>
        <div className="p-4 bg-surface-secondary rounded-lg space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('settings.verifactuSoftware')}</span>
            <span className="font-mono text-xs text-text-muted">Facturas v1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('settings.verifactuMode')}</span>
            <span className="text-xs px-2 py-0.5 bg-warning/15 text-warning rounded-full font-medium">Stub (test)</span>
          </div>
        </div>
        <button className="px-4 py-2 text-sm border border-border rounded-lg font-medium hover:bg-surface-tertiary transition-colors">
          {t('settings.verifactuRetry')}
        </button>
      </div>

      {/* Numbering Section */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {t('settings.numbering')}
          {numberingSaved && <span className="text-success text-sm">&#10003;</span>}
        </h2>
        <p className="text-sm text-text-secondary">{t('settings.numberingDesc')}</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.prefix')}</label>
            <input type="text" value={numbering.invoicePrefix} onChange={e => updateNumbering('invoicePrefix', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.quotePrefix')}</label>
            <input type="text" value={numbering.quotePrefix} onChange={e => updateNumbering('quotePrefix', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.separator')}</label>
            <input type="text" value={numbering.separator} onChange={e => updateNumbering('separator', e.target.value)} className={inputClass} maxLength={3} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('settings.includeYear')}</span>
            <button onClick={() => updateNumbering('includeYear', !numbering.includeYear)} className={`relative w-10 h-5 rounded-full transition-colors ${numbering.includeYear ? 'bg-accent' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${numbering.includeYear ? 'left-5.5 translate-x-0' : 'left-0.5'}`} style={{ left: numbering.includeYear ? '22px' : '2px' }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('settings.resetYearly')}</span>
            <button onClick={() => updateNumbering('resetYearly', !numbering.resetYearly)} className={`relative w-10 h-5 rounded-full transition-colors ${numbering.resetYearly ? 'bg-accent' : 'bg-border'}`}>
              <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: numbering.resetYearly ? '22px' : '2px' }} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-surface-secondary rounded-lg flex items-center justify-between">
          <span className="text-sm text-text-secondary">{t('settings.nextNumber')}</span>
          <span className="font-mono font-semibold text-text">{nextNumber}</span>
        </div>
      </div>
    </div>
  )
}
