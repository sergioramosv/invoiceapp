import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'
import { I18nProvider } from '@/lib/i18n'
import { Analytics } from '@/components/Analytics'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Facturas profesionales en segundos',
  description:
    'Genera facturas profesionales en PDF al instante. El generador de facturas más rápido para freelancers y empresas.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>{children}</I18nProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
