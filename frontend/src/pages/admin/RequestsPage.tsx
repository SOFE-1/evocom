import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PaymentHistoryPanel, PaymentStatusBadge } from '../../components/PaymentHistoryPanel'
import { StatusBadge } from '../../components/StatusBadge'
import { Button, Eyebrow, SectionLabel, Skeleton, cardClass, fieldClass, labelClass } from '../../components/ui'
import { api, downloadFile, errorText } from '../../lib/api'
import { formatWhen, inspectionLabel, peso, timeAgo } from '../../lib/format'
import type { MediaFile, QuoteDetail, QuoteStatus, QuoteSummary, Technician } from '../../types'
import { quoteStatuses, statusLabel } from '../../types'

type QuoteList = {
  data: QuoteSummary[]
  meta: { counts: Record<string, number | string> }
}

type Tab = 'overview' | 'quote' | 'schedule' | 'notes'

const tabs: Array<{ key: Tab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'quote', label: 'Quote & payments' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'notes', label: 'Notes' },
]

const workflow: QuoteStatus[] = ['pending', 'active', 'quoted', 'awaiting_payment', 'scheduled', 'in_progress', 'completed']

const chargeCategories = [
  'Installation labor',
  'Cabling',
  'DVR/NVR',
  'Hard drive',
  'Connectors and accessories',
  'Other materials',
]

type ChargeDraft = {
  key: string
  category: string
  description: string
  quantity: string
  unit_price: string
  finalized: boolean
}

export function RequestsPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState('')
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [counts, setCounts] = useState<Record<string, number | string>>({})
  const [loaded, setLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<QuoteDetail | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const requested = params.get('quote')
    if (requested) {
      setSelectedId(Number(requested))
    }
  }, [params])

  useEffect(() => {
    let cancelled = false
    const query = filter ? `?status=${filter}` : ''
    api<QuoteList>(`/admin/quotes${query}`)
      .then((result) => {
        if (!cancelled) {
          setQuotes(result.data)
          setCounts(result.meta.counts)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(errorText(loadError, 'Requests could not be loaded.'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [filter, version])

  useEffect(() => {
    api<{ data: Technician[] }>('/admin/technicians')
      .then((result) => setTechnicians(result.data))
      .catch(() => setTechnicians([]))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    api<{ data: QuoteDetail }>(`/admin/quotes/${selectedId}`)
      .then((result) => {
        if (!cancelled) {
          setDetail(result.data)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(errorText(loadError, 'That request could not be opened.'))
        }
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, version])

  const openId = detail?.id

  useEffect(() => {
    if (openId && !window.matchMedia('(min-width: 1280px)').matches) {
      detailRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [openId])

  const needle = query.trim().toLowerCase()
  const visibleQuotes = quotes.filter((quote) => {
    if (!needle) {
      return true
    }
    return [quote.customer_name, quote.reference_code, quote.location, quote.customer_phone]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  })
  const total = quoteStatuses.reduce((sum, status) => sum + Number(counts[status] ?? 0), 0)
  const stages = [
    { key: '', label: 'All', count: total },
    ...quoteStatuses.map((status) => ({ key: status as string, label: statusLabel[status], count: Number(counts[status] ?? 0) })),
  ]

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Eyebrow>Core request workflow</Eyebrow>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Design request workspace</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Triage incoming site plans, review technical requirements, and move approved requests into active design.
      </p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {stages.map((stage) => (
          <button
            key={stage.key}
            type="button"
            aria-pressed={filter === stage.key}
            onClick={() => setFilter(stage.key)}
            className={`min-w-[6.5rem] flex-1 rounded-xl border px-3 py-2.5 text-left transition ${
              filter === stage.key ? 'border-copper bg-copper text-white shadow-md shadow-copper/25' : 'border-line bg-white hover:border-slate-300'
            }`}
          >
            <span className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${filter === stage.key ? 'text-blue-100' : 'text-muted'}`}>
              {stage.key === 'pending' && stage.count > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              {stage.label}
            </span>
            <span className="mt-0.5 block font-display text-2xl font-bold tabular-nums">{stage.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
        <section className={cardClass}>
          <div className="border-b border-line p-4">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${fieldClass} pl-9`}
                aria-label="Search requests"
                placeholder="Search client, request ID, or property..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] bg-paper/60 px-4 py-2 font-mono text-[11px] font-medium tracking-wide text-muted">
            <span>CLIENT REQUEST</span>
            <span>RECEIVED</span>
          </div>
          {!loaded && (
            <div className="space-y-4 p-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
          {loaded && visibleQuotes.length === 0 && (
            <div className="px-4 py-14 text-center">
              <Icon name="inbox" className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm text-muted">No requests in this view.</p>
            </div>
          )}
          <ul className="divide-y divide-line overflow-hidden rounded-b-2xl">
            {visibleQuotes.map((quote) => (
              <li key={quote.id}>
                <button
                  type="button"
                  aria-pressed={selectedId === quote.id}
                  onClick={() => setSelectedId(quote.id)}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3.5 text-left transition ${
                    selectedId === quote.id ? 'bg-signal shadow-[inset_3px_0_0_var(--color-copper)]' : 'hover:bg-paper'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-semibold">{quote.customer_name}</span>
                      <span className="font-mono text-xs text-muted">{quote.reference_code}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted">{quote.location}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={quote.status} />
                      <PaymentStatusBadge status={quote.payment_status} labelled />
                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-slate-600">
                        {quote.items_count} {quote.items_count === 1 ? 'camera' : 'cameras'}
                      </span>
                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-slate-600">{inspectionLabel(quote.inspection_type)}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-xs whitespace-nowrap text-muted">
                    {timeAgo(quote.created_at)}
                    <Icon name="chevron-right" className="h-4 w-4 text-slate-400" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div ref={detailRef} className="min-w-0 scroll-mt-16">
          <RequestDetail
            detail={detail}
            technicians={technicians}
            busy={busy}
            onError={setError}
            onBusy={setBusy}
            onChanged={() => setVersion((value) => value + 1)}
          />
        </div>
      </div>
    </div>
  )
}

function WorkflowProgress({ status }: { status: QuoteStatus }) {
  if (status === 'cancelled') {
    return <p className="rounded-lg bg-sand px-3 py-2 text-sm text-muted">This request was cancelled.</p>
  }

  const position = workflow.indexOf(status)

  return (
    <div>
      <div className="flex gap-1">
        {workflow.map((step, index) => (
          <span key={step} title={statusLabel[step]} className={`h-1.5 flex-1 rounded-full ${index <= position ? 'bg-copper' : 'bg-line'}`} />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-muted">
        Step {position + 1} of {workflow.length}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function RequestDetail({
  detail,
  technicians,
  busy,
  onError,
  onBusy,
  onChanged,
}: {
  detail: QuoteDetail | null
  technicians: Technician[]
  busy: string | null
  onError: (message: string | null) => void
  onBusy: (label: string | null) => void
  onChanged: () => void
}) {
  const [prices, setPrices] = useState<Record<number, string>>({})
  const [note, setNote] = useState('')
  const [mediaIndex, setMediaIndex] = useState(0)
  const [techId, setTechId] = useState('')
  const [eventType, setEventType] = useState<'ocular' | 'installation'>('ocular')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [scheduleNotes, setScheduleNotes] = useState('')
  const [installStart, setInstallStart] = useState('')
  const [installEnd, setInstallEnd] = useState('')
  const [charges, setCharges] = useState<ChargeDraft[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const detailId = detail?.id

  useEffect(() => {
    if (!detail) {
      return
    }
    const next: Record<number, string> = {}
    for (const item of detail.items) {
      next[item.id] = item.final_unit_price ?? item.approx_unit_price
    }
    setPrices(next)
    setInstallStart(detail.installation_start_date ?? '')
    setInstallEnd(detail.installation_end_date ?? '')
    setCharges(
      (detail.charges ?? []).map((charge) => ({
        key: String(charge.id),
        category: charge.category,
        description: charge.description,
        quantity: String(Number(charge.quantity)),
        unit_price: charge.unit_price ?? '',
        finalized: charge.finalized,
      })),
    )
    setMediaIndex(0)
    setTechId(detail.assigned_technician_id ? String(detail.assigned_technician_id) : '')
  }, [detail])

  useEffect(() => {
    setTab('overview')
  }, [detailId])

  if (!detail) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-300 px-5 py-14 text-center text-sm text-muted">
        <Icon name="file" className="mx-auto mb-3 h-8 w-8 text-slate-400" />
        Select a request to see the layout, notes, technician schedule, and status.
      </aside>
    )
  }

  const media = detail.media[mediaIndex]
  const canPrice = detail.status === 'active' || detail.status === 'quoted'
  const isOpen = detail.status !== 'completed' && detail.status !== 'cancelled'

  function updateCharge(index: number, patch: Partial<ChargeDraft>) {
    setCharges((current) => current.map((charge, item) => (item === index ? { ...charge, ...patch } : charge)))
  }

  async function act(label: string, task: () => Promise<void>) {
    onBusy(label)
    onError(null)
    try {
      await task()
      onChanged()
    } catch (actionError) {
      onError(errorText(actionError, 'That update failed.'))
    } finally {
      onBusy(null)
    }
  }

  function changeStatus(status: QuoteStatus, extra?: Record<string, string>) {
    void act(status, async () => {
      await api(`/admin/quotes/${detail!.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...extra }),
      })
    })
  }

  return (
    <aside className={`xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto ${cardClass}`}>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={detail.status} />
            <span className="font-mono text-xs text-muted">{detail.reference_code}</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold">{detail.customer_name}</h2>
          <p className="text-sm text-muted">{detail.location}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 text-sm">
            <a href={`tel:${detail.customer_phone}`} className="font-medium text-copper hover:text-copper-dark">{detail.customer_phone}</a>
            <a href={`mailto:${detail.customer_email}`} className="font-medium break-all text-copper hover:text-copper-dark">{detail.customer_email}</a>
          </p>
        </div>

        <WorkflowProgress status={detail.status} />

        {isOpen && (
          <section className="rounded-xl bg-paper p-3">
            <SectionLabel>Next step</SectionLabel>
            {detail.status === 'active' && (
              <p className="mt-2 text-sm text-slate-600">Save the final prices to move this request to Quoted.</p>
            )}
            {detail.status === 'awaiting_payment' && !detail.down_payment_received_at && (
              <p className="mt-2 text-sm text-slate-600">
                Record the down payment in Payment history. Scheduling stays closed until that payment is saved.
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {detail.status === 'pending' && (
                <Button disabled={busy !== null} onClick={() => changeStatus('active')}>
                  Mark active
                </Button>
              )}
              {detail.status === 'active' && (
                <>
                  <Button onClick={() => setTab('quote')}>Set final prices</Button>
                  <Button variant="ghost" disabled={busy !== null} onClick={() => changeStatus('pending')}>
                    Return to pending
                  </Button>
                </>
              )}
              {detail.status === 'quoted' && (
                <>
                  <Button disabled={busy !== null} onClick={() => changeStatus('awaiting_payment')}>
                    Client agreed — request 70%
                  </Button>
                  <Button variant="ghost" disabled={busy !== null} onClick={() => changeStatus('active')}>
                    Reopen
                  </Button>
                </>
              )}
              {detail.status === 'awaiting_payment' && !detail.down_payment_received_at && (
                <Button onClick={() => setTab('quote')}>Open payments</Button>
              )}
              {detail.status === 'scheduled' && (
                <Button disabled={busy !== null} onClick={() => changeStatus('in_progress')}>
                  Start installation
                </Button>
              )}
              {detail.status === 'in_progress' && (
                <>
                  {detail.payment_status !== 'paid' && (
                    <p role="alert" className="w-full rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      This job still has a balance of {peso(detail.balance_remaining, 2)}. Record the remaining payment before completing it. The warranty starts only after the job is completed and fully paid.
                    </p>
                  )}
                  <Button
                    variant="pine"
                    disabled={busy !== null || detail.payment_status !== 'paid'}
                    onClick={() => {
                      if (window.confirm('Mark the project complete and start the 1-year warranty today?')) {
                        changeStatus('completed')
                      }
                    }}
                  >
                    Complete project
                  </Button>
                </>
              )}
              <Button
                variant="danger"
                disabled={busy !== null}
                onClick={() => {
                  if (window.confirm('Cancel this request?')) {
                    changeStatus('cancelled')
                  }
                }}
              >
                Cancel request
              </Button>
            </div>
            {detail.status === 'awaiting_payment' && detail.down_payment_received_at && (
              <form
                className="mt-3 space-y-2 border-t border-line pt-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  changeStatus('scheduled', {
                    installation_start_date: installStart,
                    installation_end_date: installEnd,
                  })
                }}
              >
                <p className="text-xs text-pine">Down payment recorded {formatWhen(detail.down_payment_received_at)}.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className={labelClass}>
                    Installation start
                    <input className={`${fieldClass} mt-1`} type="date" required min={manilaDate()} value={installStart} onChange={(event) => setInstallStart(event.target.value)} />
                  </label>
                  <label className={labelClass}>
                    Promised completion
                    <input className={`${fieldClass} mt-1`} type="date" required min={installStart || manilaDate()} value={installEnd} onChange={(event) => setInstallEnd(event.target.value)} />
                  </label>
                </div>
                <Button type="submit" disabled={busy !== null}>
                  Schedule installation
                </Button>
              </form>
            )}
          </section>
        )}
      </div>

      <div role="tablist" aria-label="Request details" className="sticky top-0 z-10 flex overflow-x-auto border-y border-line bg-white px-3">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
              tab === item.key ? 'border-copper text-copper' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-5 p-5">
        {tab === 'overview' && (
          <>
            <Section title="Summary">
              <div className="rounded-xl bg-paper p-3 text-sm leading-6">
                {detail.message || `${inspectionLabel(detail.inspection_type)} inspection requested.`}
              </div>
            </Section>

            <Section title="Layout file">
              {detail.media.length === 0 ? (
                <p className="text-sm text-muted">
                  {detail.inspection_type === 'ocular'
                    ? 'Ocular request. A technician visits, so there is no layout file.'
                    : 'No layout file was stored with this request.'}
                </p>
              ) : (
                <>
                  <MediaFrame file={media} />
                  {detail.media.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {detail.media.map((file, index) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setMediaIndex(index)}
                          className={`rounded-lg border px-2 py-1 text-xs transition ${index === mediaIndex ? 'border-copper bg-signal' : 'border-line hover:border-slate-300'}`}
                        >
                          {file.original_name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Section>

            {detail.warranty && (
              <section className="rounded-xl bg-foam p-3">
                <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-pine uppercase">Warranty</h3>
                <p className="mt-1 text-sm">
                  {detail.warranty.status === 'active' ? 'Active' : 'Expired'} from {formatWhen(detail.warranty.starts_at)} to{' '}
                  {formatWhen(detail.warranty.ends_at)}.
                </p>
              </section>
            )}

            <Section title="Status history">
              <ol className="space-y-2 border-l-2 border-line pl-3 text-xs text-muted">
                {detail.status_events.map((event) => (
                  <li key={event.id}>
                    <span className="font-medium text-ink">
                      {event.from_status ? statusLabel[event.from_status] : 'New'} → {statusLabel[event.to_status]}
                    </span>
                    <span className="block">{event.actor_name} · {formatWhen(event.created_at)}</span>
                  </li>
                ))}
              </ol>
            </Section>
          </>
        )}

        {tab === 'quote' && (
          <>
            <Section title="Quotation">
              <div className="space-y-3">
                {detail.items.length === 0 && (
                  <p className="text-sm text-muted">
                    No cameras on this request. Add labor or materials below. Estimates stay out of the total until you mark them finalized.
                  </p>
                )}
                {detail.items.map((item) => (
                  <label key={item.id} className="block text-sm">
                    <span className="font-medium">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="block text-xs text-muted">Approx. {peso(item.approx_unit_price)} each</span>
                    {canPrice ? (
                      <input
                        className={`${fieldClass} mt-1`}
                        inputMode="decimal"
                        value={prices[item.id] ?? ''}
                        onChange={(event) => setPrices((current) => ({ ...current, [item.id]: event.target.value }))}
                      />
                    ) : (
                      <span className="block text-sm tabular-nums">Final {peso(item.final_unit_price, 2)}</span>
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <SectionLabel>Labor and materials</SectionLabel>
                {charges.map((charge, index) => (
                  <div key={charge.key} className="space-y-2 rounded-lg bg-paper p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className={labelClass}>
                        Category
                        <select
                          className={`${fieldClass} mt-1`}
                          disabled={!canPrice}
                          value={charge.category}
                          onChange={(event) => updateCharge(index, { category: event.target.value })}
                        >
                          {chargeCategories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        Description
                        <input
                          className={`${fieldClass} mt-1`}
                          disabled={!canPrice}
                          value={charge.description}
                          onChange={(event) => updateCharge(index, { description: event.target.value })}
                        />
                      </label>
                      <label className={labelClass}>
                        Quantity
                        <input
                          className={`${fieldClass} mt-1`}
                          inputMode="decimal"
                          disabled={!canPrice}
                          value={charge.quantity}
                          onChange={(event) => updateCharge(index, { quantity: event.target.value })}
                        />
                      </label>
                      <label className={labelClass}>
                        Unit price
                        <input
                          className={`${fieldClass} mt-1`}
                          inputMode="decimal"
                          disabled={!canPrice}
                          value={charge.unit_price}
                          onChange={(event) => updateCharge(index, { unit_price: event.target.value })}
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-copper"
                        disabled={!canPrice}
                        checked={charge.finalized}
                        onChange={(event) => updateCharge(index, { finalized: event.target.checked })}
                      />
                      {charge.finalized ? 'Included in the quotation total' : 'Estimate only — not in the total'}
                    </label>
                    {canPrice && (
                      <button type="button" className="text-xs font-semibold text-red-700" onClick={() => setCharges((current) => current.filter((_, item) => item !== index))}>
                        Remove line
                      </button>
                    )}
                  </div>
                ))}
                {canPrice && (
                  <button
                    type="button"
                    className="text-sm font-semibold text-copper"
                    onClick={() =>
                      setCharges((current) => [
                        ...current,
                        {
                          key: `new-${Date.now()}`,
                          category: 'Installation labor',
                          description: '',
                          quantity: '1',
                          unit_price: '',
                          finalized: false,
                        },
                      ])
                    }
                  >
                    Add labor or material
                  </button>
                )}
              </div>
              {canPrice && (
                <Button
                  className="mt-3 w-full"
                  variant="night"
                  disabled={busy !== null}
                  onClick={() =>
                    void act('pricing', async () => {
                      await api(`/admin/quotes/${detail.id}/pricing`, {
                        method: 'PUT',
                        body: JSON.stringify({
                          items: detail.items.map((item) => ({
                            id: item.id,
                            final_unit_price: prices[item.id],
                          })),
                          charges: charges.map((charge) => ({
                            category: charge.category,
                            description: charge.description,
                            quantity: charge.quantity,
                            unit_price: charge.unit_price.trim() === '' ? null : charge.unit_price,
                            finalized: charge.finalized,
                          })),
                        }),
                      })
                    })
                  }
                >
                  {detail.status === 'active' ? 'Save quotation' : 'Update quotation'}
                </Button>
              )}
              {detail.quoted_total && detail.status !== 'pending' && detail.status !== 'active' && (
                <Button
                  className="mt-2 w-full"
                  variant="ghost"
                  disabled={busy !== null}
                  onClick={() =>
                    void act('pdf', async () => {
                      await downloadFile(`/admin/quotes/${detail.id}/pdf`, `${detail.reference_code}.pdf`)
                    })
                  }
                >
                  Download quotation PDF
                </Button>
              )}
              {detail.quoted_total && (
                <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm">
                  Quoted total <span className="font-semibold tabular-nums">{peso(detail.quoted_total, 2)}</span>. Down payment {detail.down_payment_percent}% is{' '}
                  <span className="font-semibold tabular-nums">{peso(detail.down_payment_amount, 2)}</span>.
                </p>
              )}
            </Section>
            <div className="border-t border-line pt-5">
              <PaymentHistoryPanel
                bare
                account={detail}
                onRecord={async (input) => {
                  await api(`/admin/quotes/${detail.id}/payments`, {
                    method: 'POST',
                    body: JSON.stringify(input),
                  })
                  onChanged()
                }}
              />
            </div>
          </>
        )}

        {tab === 'schedule' && (
          <Section title="Technician scheduler">
            <p className="text-sm text-muted">Assigned: {detail.assigned_technician_name ?? 'Unassigned'}</p>
            <form
              className="mt-3 space-y-3"
              onSubmit={(event: FormEvent) => {
                event.preventDefault()
                void act('schedule', async () => {
                  await api(`/admin/quotes/${detail.id}/schedules`, {
                    method: 'POST',
                    body: JSON.stringify({
                      technician_id: Number(techId),
                      event_type: eventType,
                      starts_at: startsAt,
                      ends_at: endsAt,
                      notes: scheduleNotes,
                    }),
                  })
                  setScheduleNotes('')
                })
              }}
            >
              {technicians.length === 0 && (
                <p className="rounded-lg bg-paper px-3 py-2 text-sm text-slate-600">
                  No technicians yet. <Link to="/admin/schedule" className="font-semibold text-copper">Add one in the calendar</Link> first.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Technician
                  <select className={`${fieldClass} mt-1`} required value={techId} onChange={(event) => setTechId(event.target.value)}>
                    <option value="">Select technician</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>
                  Visit type
                  <select className={`${fieldClass} mt-1`} value={eventType} onChange={(event) => setEventType(event.target.value as 'ocular' | 'installation')}>
                    <option value="ocular">Ocular visit</option>
                    <option value="installation">Installation</option>
                  </select>
                </label>
                <label className={labelClass}>
                  Starts
                  <input className={`${fieldClass} mt-1`} type="datetime-local" required min={manilaDateTime()} value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </label>
                <label className={labelClass}>
                  Ends
                  <input className={`${fieldClass} mt-1`} type="datetime-local" required min={startsAt || manilaDateTime()} value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
                </label>
              </div>
              <label className={labelClass}>
                Schedule note
                <input className={`${fieldClass} mt-1`} value={scheduleNotes} onChange={(event) => setScheduleNotes(event.target.value)} />
              </label>
              <Button type="submit" variant="ghost" className="w-full" disabled={busy !== null || technicians.length === 0}>
                <Icon name="calendar" className="h-4 w-4" />
                Add to calendar
              </Button>
            </form>
            {detail.schedules.length > 0 && (
              <ul className="mt-4 space-y-2">
                {detail.schedules.map((event) => (
                  <li key={event.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">
                        {event.event_type === 'ocular' ? 'Ocular' : 'Installation'}
                        {event.cancelled_at ? ' · Cancelled' : ''}
                      </span>
                      {!event.cancelled_at && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-700"
                          onClick={() => {
                            if (window.confirm('Cancel this visit? The record stays for tracking, and the client appointment status is updated when the scheduled installation is removed.')) {
                              void act('cancel-visit', async () => {
                                await api(`/admin/schedules/${event.id}`, { method: 'DELETE' })
                              })
                            }
                          }}
                        >
                          Cancel visit
                        </button>
                      )}
                    </div>
                    <span className="block text-xs text-muted">
                      {event.technician_name} · {formatWhen(event.starts_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {tab === 'notes' && (
          <Section title="Notes history">
            <ul className="space-y-2">
              {detail.notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
              {detail.notes.map((entry) => (
                <li key={entry.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                  <span className="font-medium">{entry.author_name}</span>
                  <span className="ml-2 text-xs text-muted">{formatWhen(entry.created_at)}</span>
                  <p className="mt-1">{entry.body}</p>
                </li>
              ))}
            </ul>
            <form
              className="mt-3 space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                void act('note', async () => {
                  await api(`/admin/quotes/${detail.id}/notes`, {
                    method: 'POST',
                    body: JSON.stringify({ body: note }),
                  })
                  setNote('')
                })
              }}
            >
              <textarea
                className={`${fieldClass} min-h-20`}
                aria-label="Add a note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a note"
              />
              <Button type="submit" variant="ghost" className="w-full" disabled={busy !== null || note.trim() === ''}>
                Save note
              </Button>
            </form>
          </Section>
        )}
      </div>
    </aside>
  )
}

function manilaDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date())
}

function manilaDateTime(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}`
}

function MediaFrame({ file }: { file: MediaFile | undefined }) {
  if (!file) {
    return null
  }
  if (file.kind === 'site_video') {
    return <video className="w-full rounded-lg bg-night" controls src={file.url} />
  }
  return <img className="max-h-56 w-full rounded-lg bg-night object-contain" src={file.url} alt={file.original_name} />
}
