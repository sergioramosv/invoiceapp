import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InvoiceApp',
    short_name: 'InvoiceApp',
    description: 'Crea facturas y presupuestos profesionales',
    start_url: '/workspace',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/logo.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/logo.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  }
}
