import { Link } from 'react-router-dom'
import { services } from '../config'
import { Icon, type IconName } from './Icon'
import { Eyebrow, buttonClass } from './ui'

const icons: IconName[] = ['camera', 'monitor', 'shield', 'cloud', 'radar', 'wrench']

export function ServiceGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <article
          key={service.title}
          className="group rounded-2xl border border-line bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-lift"
        >
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-signal text-copper transition group-hover:bg-copper group-hover:text-white">
              <Icon name={icons[index] ?? 'camera'} />
            </span>
            <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{service.body}</p>
        </article>
      ))}
    </div>
  )
}

export function SurveyBanner() {
  return (
    <section className="shell py-14">
      <div className="viewfinder relative isolate overflow-hidden rounded-3xl bg-copper px-6 py-10 text-white [--vf:rgb(255_255_255/0.5)] [--vf-inset:16px] sm:px-12 sm:py-12">
        <div className="bg-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -right-24 -bottom-32 -z-10 h-80 w-80 rounded-full bg-copper-dark blur-3xl" />
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Eyebrow tone="light" className="text-blue-100">Site survey</Eyebrow>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Not sure how many cameras you need?</h2>
            <p className="mt-2 text-sm text-blue-100 sm:text-base">Tell us about the property and we will prepare a quotation after the site is reviewed.</p>
          </div>
          <Link to="/request-quote" className={buttonClass('white', 'shrink-0 px-5 py-3')}>
            Request a Quote
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
