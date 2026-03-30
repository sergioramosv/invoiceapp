'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Error inesperado</h2>
          <p className="text-gray-600 mb-6">Ha ocurrido un error. Por favor, int&eacute;ntalo de nuevo.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
