export function Analytics() {
  if (process.env.NODE_ENV !== 'production') return null
  return (
    <script
      defer
      data-domain=""
      src="https://plausible.io/js/script.js"
    />
  )
}
