import { Link } from 'react-router-dom'
import { services } from '../config'

const icons = ['camera', 'monitor', 'shield', 'cloud', 'radar', 'wrench'] as const

export function ServiceGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <article key={service.title} className="bg-white p-6">
          <ServiceIcon name={icons[index] ?? 'camera'} />
          <h3 className="mt-4 text-base font-semibold">{service.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{service.body}</p>
        </article>
      ))}
    </div>
  )
}

export function SurveyBanner() {
  return (
    <section className="bg-copper">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Not sure how many cameras you need?</h2>
          <p className="mt-1 text-sm text-blue-100">We’ll do a free site survey and send you a no-obligation quote.</p>
        </div>
        <Link to="/contact#request" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-copper hover:bg-blue-50">
          Book a Free Survey
        </Link>
      </div>
    </section>
  )
}

function ServiceIcon({ name }: { name: (typeof icons)[number] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-copper" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {name === 'camera' && <path d="M4 8h4l2-2h4l2 2h4v10H4z M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />}
      {name === 'monitor' && <path d="M4 5h16v10H4z M8 19h8 M12 15v4" />}
      {name === 'shield' && <path d="M12 3 5 6v6c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6z" />}
      {name === 'cloud' && <path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5-1.5A3.5 3.5 0 0 0 7 18z" />}
      {name === 'radar' && <path d="M12 12h.01 M12 7a5 5 0 0 1 5 5 M12 4a8 8 0 0 1 8 8 M5 19l14-7" />}
      {name === 'wrench' && <path d="M14 6a4 4 0 0 0-5 5L4 16l4 4 5-5a4 4 0 0 0 5-5l-2.5 2.5L13 10l2.5-2.5z" />}
    </svg>
  )
}
