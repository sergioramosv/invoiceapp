import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-secondary">
      <h1 className="text-5xl font-bold text-text tracking-tight">InvoiceApp</h1>
      <p className="mt-4 text-text-secondary text-lg">Crea facturas profesionales en segundos</p>
      <div className="mt-8 flex gap-4">
        <Link href="/login" className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Iniciar sesión
        </Link>
        <Link href="/signup" className="px-8 py-3 border border-border text-text rounded-lg font-medium hover:bg-surface-tertiary transition-colors">
          Crear cuenta
        </Link>
      </div>
    </div>
  )
}
