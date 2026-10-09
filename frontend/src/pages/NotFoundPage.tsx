import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <p className="font-display text-6xl tracking-wide">404</p>
      <p className="mt-3 text-sm text-muted">That page is not part of the site.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-copper">
        Back home
      </Link>
    </div>
  )
}
