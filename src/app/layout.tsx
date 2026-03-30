import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { I18nProvider } from '@/lib/i18n'
import { Analytics } from '@/components/Analytics'
import './globals.css'

export const metadata: Metadata = {
  title: 'InvoiceApp — Crea facturas profesionales en segundos',
  description:
    'Genera facturas profesionales en PDF al instante. El generador de facturas más rápido para freelancers y empresas en España.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
  metadataBase: new URL('https://invoiceapp.es'),
  openGraph: {
    title: 'InvoiceApp — Crea facturas profesionales en segundos',
    description:
      'Genera facturas profesionales en PDF al instante. El generador de facturas más rápido para freelancers y empresas en España.',
    type: 'website',
    url: 'https://invoiceapp.es',
    siteName: 'InvoiceApp',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceApp — Crea facturas profesionales en segundos',
    description:
      'Genera facturas profesionales en PDF al instante. El generador de facturas más rápido para freelancers y empresas en España.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
