import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageMeta } from '../components/PageMeta'
import { PageHero } from '../components/PageHero'
import { QuoteForm } from '../components/QuoteForm'
import { cardClass } from '../components/ui'
import { company, terms } from '../config'

const nextSteps = [
  'We review your request and confirm the details with you.',
  'A specialist inspects the site, on location or from your media.',
  'You receive final prices in PHP before you decide.',
  `Installation is scheduled after the ${terms.downPaymentPercent}% down payment.`,
]

export function RequestQuotePage() {
  return (
    <div>
      <PageMeta
        title="Request a Quote | Evocom"
        description="Request a CCTV quotation from Evocom Information Technology Services for cameras, installation labor, or both. No payment is taken on this form."
      />
      <PageHero eyebrow="Request a Quote" title="Quotation for cameras or installation">
        Ask about CCTV cameras, system design, or installation. Add products from the catalog if you already know the models, or send the form with your site details and we will recommend a setup.
      </PageHero>
      <section className="shell grid items-start gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-14">
        <QuoteForm />
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className={`p-5 ${cardClass}`}>
            <h2 className="text-lg font-bold">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {nextSteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tide font-mono text-[11px] font-semibold text-tide-ink">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-night p-5 text-white">
            <p className="font-display font-bold">Prefer to talk to us?</p>
            <a href={company.phoneHref} className="mt-2 flex items-center gap-2.5 text-sm font-medium text-slate-200 transition hover:text-white">
              <Icon name="phone" className="h-4 w-4 text-blue-300" />
              {company.phoneDisplay}
            </a>
            <a href={`mailto:${company.email}`} className="mt-2 flex items-center gap-2.5 text-sm font-medium break-all text-slate-200 transition hover:text-white">
              <Icon name="mail" className="h-4 w-4 text-blue-300" />
              {company.email}
            </a>
            <Link to="/track" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-white">
              Track a request
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
