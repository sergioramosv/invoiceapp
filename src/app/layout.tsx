import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InvoiceApp — Crea facturas profesionales en segundos',
  description: 'Genera facturas profesionales en PDF al instante. Sin registro, sin complicaciones.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
