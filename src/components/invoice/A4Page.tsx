'use client'

import { forwardRef, useRef, useState, useEffect } from 'react'

const A4_WIDTH = 794
const A4_HEIGHT = 1123

const A4Page = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(0.4)

    useEffect(() => {
      function updateScale() {
        if (!containerRef.current) return
        const containerWidth = containerRef.current.offsetWidth
        setScale(Math.min(containerWidth / A4_WIDTH, 1))
      }

      updateScale()
      const observer = new ResizeObserver(updateScale)
      if (containerRef.current) observer.observe(containerRef.current)
      return () => observer.disconnect()
    }, [])

    return (
      <div ref={containerRef} className="w-full overflow-hidden">
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: A4_WIDTH,
            height: A4_HEIGHT,
            marginBottom: A4_HEIGHT * (scale - 1),
          }}
        >
          <div
            ref={ref}
            className="bg-white shadow-lg rounded-sm light-paper"
            style={{ width: A4_WIDTH, minHeight: A4_HEIGHT }}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)

A4Page.displayName = 'A4Page'
export default A4Page
