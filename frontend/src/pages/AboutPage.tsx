import { QuoteForm } from '../components/QuoteForm'
import { SurveyBanner } from '../components/ServiceGrid'
import { company } from '../config'

const points = [
  { title: 'Licensed Engineers', body: 'Fully certified & insured installers' },
  { title: 'Tailored Designs', body: 'No blind spots, no wasted cameras' },
  { title: 'Fast Installation', body: 'Most systems live within a day' },
  { title: 'Aftercare Included', body: 'Ongoing support & maintenance' },
]

export function AboutPage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2">
        <div className="relative">
          <img src="/media/laptop.jpg" alt="Laptop showing a monitoring dashboard" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div className="absolute bottom-4 left-4 rounded-xl bg-copper px-4 py-3 text-white shadow-lg">
            <p className="text-2xl font-bold">12+</p>
            <p className="text-xs">Years installing security systems</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper">ABOUT US</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Your trusted CCTV specialists since {company.since}</h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            {company.legalName} is a specialist CCTV and security camera installation company. Over more than a decade, we have designed and installed surveillance systems for over 1,200 residential and commercial clients — from a single doorbell camera to full multi-site HD networks.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Every installation is carried out by our trained, fully licensed engineers. We take time to understand your premises, identify vulnerabilities, and deliver a tailored system — then back it with ongoing maintenance and round-the-clock support.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point.title}>
                <p className="text-sm font-semibold">{point.title}</p>
                <p className="text-sm text-muted">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SurveyBanner />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
        <ContactAside />
        <QuoteForm />
      </section>
    </div>
  )
}

export function ContactAside() {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-copper">CONTACT US</p>
      <h2 className="mt-3 text-4xl font-bold tracking-tight">Let’s secure your property</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Whether it’s a single home camera or a 40-camera warehouse system — get in touch and we’ll arrange a free consultation at your convenience.
      </p>
      <ul className="mt-6 space-y-4 text-sm">
        <li>
          <p className="text-xs font-semibold tracking-wide text-muted">ADDRESS</p>
          {company.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </li>
        <li>
          <p className="text-xs font-semibold tracking-wide text-muted">PHONE</p>
          <a href={company.phoneHref} className="font-medium">{company.phoneDisplay}</a>
        </li>
        <li>
          <p className="text-xs font-semibold tracking-wide text-muted">EMAIL</p>
          <a href={`mailto:${company.email}`} className="font-medium">{company.email}</a>
        </li>
      </ul>
      <iframe
        title="Evocom Information Technology Services on Google Maps"
        src={`https://maps.google.com/maps?q=${company.mapQuery}&z=14&output=embed`}
        className="mt-6 h-56 w-full rounded-xl border border-line"
        loading="lazy"
      />
      <a
        className="mt-2 inline-block text-xs text-copper"
        href={`https://www.google.com/maps/search/?api=1&query=${company.mapQuery}`}
        target="_blank"
        rel="noreferrer"
      >
        View {company.legalName} on Google Maps
      </a>
    </div>
  )
}
