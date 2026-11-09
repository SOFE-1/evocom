import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BotGuardFields } from '../components/BotGuardFields'
import { PageMeta } from '../components/PageMeta'
import { PageHero } from '../components/PageHero'
import { buttonClass, cardClass, fieldClass, labelClass } from '../components/ui'
import { api, errorText } from '../lib/api'
import { formatWhen, peso } from '../lib/format'
import { statusLabel, type QuoteStatus } from '../types'

type TrackVisit = {
  event_type: 'ocular' | 'installation'
  starts_at: string
  ends_at: string
}

type TrackResult = {
  reference_code: string
  status: QuoteStatus
  quotation_ready: boolean
  quoted_total: string | null
  payment_status: 'pending' | 'partial' | 'paid' | null
  balance_remaining: string | null
  installation_start_date: string | null
  installation_end_date: string | null
  visits: TrackVisit[]
}

const paymentLabel = {
  pending: 'No payment recorded',
  partial: 'Partial payment',
  paid: 'Paid in full',
}

export function TrackPage() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [formLoadedAt] = useState(() => Math.floor(Date.now() / 1000))

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const native = new FormData(event.currentTarget)
    try {
      const response = await api<{ data: TrackResult }>('/quotes/track', {
        method: 'POST',
        body: JSON.stringify({
          reference_code: reference.trim(),
          email: email.trim(),
          company_website: String(native.get('company_website') ?? ''),
          form_loaded_at: formLoadedAt,
        }),
      })
      setResult(response.data)
    } catch (trackError) {
      setResult(null)
      setError(errorText(trackError, 'That request could not be found.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageMeta
        title="Track a request | Evocom"
        description="Check an Evocom quotation request with the reference number and the email address used on the form."
      />
      <PageHero eyebrow="Request status" title="Track a quotation request">
        Enter the reference number from your confirmation and the email address you used on the form.
      </PageHero>
      <section className="shell grid items-start gap-6 py-10 lg:grid-cols-2 lg:py-14">
        <form onSubmit={onSubmit} className={`relative space-y-4 p-6 ${cardClass}`}>
          <BotGuardFields formLoadedAt={formLoadedAt} />
          <label className={labelClass}>
            Reference number
            <input className={`${fieldClass} mt-1.5 font-mono`} required value={reference} onChange={(event) => setReference(event.target.value)} placeholder="EVO-20261031-0001" />
          </label>
          <label className={labelClass}>
            Email
            <input className={`${fieldClass} mt-1.5`} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={buttonClass('primary', 'w-full py-3')}>
            {busy ? 'Checking…' : 'Check status'}
          </button>
        </form>
        <div className={`p-6 ${cardClass}`}>
          {result ? (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted">Reference number</dt>
                <dd className="mt-1 font-mono text-base font-semibold">{result.reference_code}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Request status</dt>
                <dd className="mt-1 font-semibold">{statusLabel[result.status]}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Quotation status</dt>
                <dd className="mt-1">
                  {result.quotation_ready
                    ? `Quotation ready · ${peso(result.quoted_total, 2)}`
                    : 'A quotation has not been finalized yet.'}
                </dd>
              </div>
              {result.quotation_ready && result.payment_status && (
                <div>
                  <dt className="text-xs font-medium text-muted">Payment status</dt>
                  <dd className="mt-1">
                    {paymentLabel[result.payment_status]}
                    {result.balance_remaining && result.payment_status !== 'paid' ? ` · balance ${peso(result.balance_remaining, 2)}` : ''}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-muted">Installation schedule</dt>
                <dd className="mt-1">
                  {result.installation_start_date
                    ? `${result.installation_start_date} to ${result.installation_end_date ?? result.installation_start_date}`
                    : 'No installation dates yet.'}
                </dd>
              </div>
              {result.visits.length > 0 && (
                <div>
                  <dt className="text-xs font-medium text-muted">Scheduled visits</dt>
                  <dd className="mt-2 space-y-2">
                    {result.visits.map((visit) => (
                      <p key={`${visit.event_type}-${visit.starts_at}`}>
                        {visit.event_type === 'ocular' ? 'Site visit' : 'Installation'} · {formatWhen(visit.starts_at)}
                      </p>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Status, quotation, schedule, and payment progress appear here. Internal notes are not shown.
              Need to start a request? <Link to="/request-quote" className="font-semibold text-copper">Request a Quote</Link>.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
