export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <nav className="border-b border-border bg-surface px-6 py-3">
        <span className="font-bold text-lg">InvoiceApp</span>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
