import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { PageHero } from '../components/PageHero'
import { PageMeta } from '../components/PageMeta'
import { cardClass } from '../components/ui'
import { company } from '../config'

export function ContactPage() {
  const { hash } = useLocation()
  if (hash === '#request') {
    return <Navigate to="/request-quote" replace />
  }

  return (
    <div>
      <PageMeta
        title="Contact Evocom Information Technology Services"
        description="Contact Evocom Information Technology Services in Rodriguez, Rizal by phone, email, or the quotation form."
      />
      <PageHero eyebrow="Contact us" title="Contact us">
        Call, email, or send a quotation request. The office is in Rodriguez, Rizal.
      </PageHero>
      <section className="shell grid items-start gap-6 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:py-14">
        <div className="space-y-4">
          <ContactCard icon="pin" label="Address">
            {company.addressLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </ContactCard>
          <ContactCard icon="phone" label="Phone">
            <a href={company.phoneHref} className="font-semibold transition hover:text-copper">{company.phoneDisplay}</a>
          </ContactCard>
          <ContactCard icon="mail" label="Email">
            <a href={`mailto:${company.email}`} className="font-semibold break-all transition hover:text-copper">{company.email}</a>
          </ContactCard>
        </div>
        <div className={`overflow-hidden ${cardClass}`}>
          <iframe
            title="Evocom Information Technology Services on Google Maps"
            src={`https://maps.google.com/maps?q=${company.mapQuery}&z=14&output=embed`}
            className="block h-80 w-full lg:h-[28rem]"
            loading="lazy"
          />
          <a
            className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-copper transition hover:bg-signal"
            href={`https://www.google.com/maps/search/?api=1&query=${company.mapQuery}`}
            target="_blank"
            rel="noreferrer"
          >
            View {company.legalName} on Google Maps
            <Icon name="external" className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  )
}

function ContactCard({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <div className={`flex gap-4 p-5 ${cardClass}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal text-copper">
        <Icon name={icon} />
      </span>
      <div className="min-w-0 text-sm leading-6">
        <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}
