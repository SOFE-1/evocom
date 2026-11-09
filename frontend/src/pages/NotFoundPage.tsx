import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageMeta } from '../components/PageMeta'
import { buttonClass } from '../components/ui'

export function NotFoundPage() {
  return (
    <section className="relative isolate grid place-items-center overflow-hidden bg-night px-5 py-24 text-center text-white">
      <PageMeta title="Page not found | Evocom" description="That page is not part of the Evocom website." />
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="viewfinder relative w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-14 [--vf:rgb(255_255_255/0.5)]">
        <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-slate-300">
          <span className="h-2 w-2 animate-rec rounded-full bg-red-500" />
          CAM 404
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">No signal</h1>
        <p className="mt-3 text-sm text-slate-300">That page is not part of the site.</p>
        <Link to="/" className={buttonClass('primary', 'mt-6')}>
          <Icon name="arrow-left" className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </section>
  )
}
