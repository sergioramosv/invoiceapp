'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { uid } from '@/lib/uid'
import { useI18n } from '@/lib/i18n'

type Mode = 'draw' | 'upload'

interface SignaturePadProps {
  value: string
  onChange: (dataUrl: string) => void
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('draw')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showEditor, setShowEditor] = useState(!value)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputId = useRef(uid())

  /* ── Initialise canvas with white background ── */
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    if (mode === 'draw' && showEditor) {
      clearCanvas()
    }
  }, [mode, showEditor, clearCanvas])

  /* ── Drawing helpers ── */
  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return null
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      }
    }
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setIsDrawing(true)
  }

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return
    e.preventDefault()
    const pos = getPos(e)
    if (!pos) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL())
    setShowEditor(false)
  }

  /* ── Upload handler ── */
  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return
    if (!/\.(png|jpe?g|svg|webp)$/i.test(file.name)) return
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      setShowEditor(false)
    }
    reader.readAsDataURL(file)
  }

  /* ── If value already set, show preview ── */
  if (value && !showEditor) {
    return (
      <div className="flex items-center gap-4">
        <img
          src={value}
          alt="Firma"
          className="h-20 object-contain border border-border rounded-lg p-2"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowEditor(true)}
            className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
          >
            {t('signature.change')}
          </button>
          <button
            type="button"
            onClick={() => onChange('')}
            className="px-3 py-1.5 text-sm font-medium text-danger border border-danger rounded-lg hover:bg-danger/5 transition-colors"
          >
            {t('signature.delete')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'draw'
              ? 'bg-text text-surface'
              : 'border border-border text-text hover:bg-surface-secondary'
          }`}
        >
          {t('signature.draw')}
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'upload'
              ? 'bg-text text-surface'
              : 'border border-border text-text hover:bg-surface-secondary'
          }`}
        >
          {t('signature.upload')}
        </button>
      </div>

      {/* Draw mode */}
      {mode === 'draw' && (
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="border border-border rounded-lg cursor-crosshair w-full touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3 py-1.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-secondary transition-colors"
            >
              {t('signature.clear')}
            </button>
            <button
              type="button"
              onClick={saveSignature}
              className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              {t('signature.save')}
            </button>
          </div>
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center text-text-secondary text-sm cursor-pointer hover:border-primary/40 transition-colors"
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const file = e.dataTransfer.files?.[0]
            if (file) handleFile(file)
          }}
          onClick={() =>
            document.getElementById(`sig-input-${inputId.current}`)?.click()
          }
        >
          <input
            id={`sig-input-${inputId.current}`}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <p>{t('signature.dropText')}</p>
          <p className="text-xs text-text-muted mt-1">
            {t('signature.dropHint')}
          </p>
        </div>
      )}
    </div>
  )
}
