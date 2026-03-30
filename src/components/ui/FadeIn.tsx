'use client'
import { useEffect, useRef, useState } from 'react'

const delayClasses: Record<number, string> = {
  0: '',
  100: 'delay-100',
  200: 'delay-200',
  300: 'delay-300',
  400: '[transition-delay:400ms]',
  500: 'delay-500',
  600: '[transition-delay:600ms]',
  700: 'delay-700',
  800: '[transition-delay:800ms]',
}

export function FadeIn({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const delayClass = delayClasses[delay] || ''

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${delayClass} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}
