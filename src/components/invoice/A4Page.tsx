'use client'

import { forwardRef, useRef, useState, useEffect } from 'react'

const A4_WIDTH = 794 // 210mm at 96dpi
const A4_HEIGHT = 1123 // 297mm at 96dpi

const A4Page = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(0.5)

    useEffect(() => {
      function updateScale() {
        if (!containerRef.current) return
        const containerWidth = containerRef.current.offsetWidth
        const newScale = Math.min((containerWidth - 8) / A4_WIDTH, 1)
        setScale(newScale)
      }

      updateScale()
      const observer = new ResizeObserver(updateScale)
      if (containerRef.current) observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [])

    return (
      <div ref={containerRef} className="w-full">
        <div
          className="origin-top-left"
          // Scale transform needs inline style because Tailwind can't do dynamic scale values
          // eslint-disable-next-line
          style={{ transform: `scale(${scale})`, width: A4_WIDTH, height: A4_HEIGHT }}
        >
          <div
            ref={ref}
            className="bg-white shadow-lg border border-border overflow-hidden"
            // Fixed A4 dimensions need inline style
            // eslint-disable-next-line
            style={{ width: A4_WIDTH, minHeight: A4_HEIGHT }}
          >
            {children}
          </div>
        </div>
        {/* Spacer to account for scaled height */}
        <div
          // eslint-disable-next-line
          style={{ height: A4_HEIGHT * scale - A4_HEIGHT }}
        />
      </div>
    )
  }
)

A4Page.displayName = 'A4Page'
export default A4Page
