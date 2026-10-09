import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { StatusBadge } from '../../components/StatusBadge'
import { Button, fieldClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { formatWhen, inspectionLabel, peso, timeAgo } from '../../lib/format'
import type { MediaFile, QuoteDetail, QuoteStatus, QuoteSummary, Technician } from '../../types'
import { quoteStatuses, statusLabel } from '../../types'

type QuoteList = {
  data: QuoteSummary[]
  meta: { counts: Record<string, number | string> }
}

export function RequestsPage() {
  const [params] = useSearchParams()
  const [filter, setFilter] = useState('')
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [counts, setCounts] = useState<Record<string, number | string>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<QuoteDetail | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')

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
  const pendingCount = Number(counts.pending ?? 0)
  const activeCount = Number(counts.active ?? 0)

  return (
    <div className="px-4 py-6 lg:px-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted">CORE REQUEST WORKFLOW</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Design request workspace</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Triage incoming site plans, review technical requirements, and move approved requests into active design.
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Request dashboard</h2>
              <p className="text-sm text-muted">Review and manage incoming system design requests.</p>
            </div>
            <div className="inline-flex rounded-full bg-paper p-1 text-sm">
              <button type="button" onClick={() => setFilter('pending')} className={`rounded-full px-3 py-1 font-medium ${filter === 'pending' ? 'bg-white shadow-sm' : ''}`}>
                Pending <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-xs text-amber-800">{pendingCount}</span>
              </button>
              <button type="button" onClick={() => setFilter('active')} className={`rounded-full px-3 py-1 font-medium ${filter === 'active' ? 'bg-white shadow-sm' : ''}`}>
                Active <span className="ml-1 rounded-full bg-blue-100 px-1.5 text-xs text-blue-800">{activeCount}</span>
              </button>
            </div>
          </div>
          <input
            className={`${fieldClass} mt-4`}
            placeholder="Search client, request ID, or property..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip label="All" active={filter === ''} onClick={() => setFilter('')} />
            {quoteStatuses.filter((status) => status !== 'pending' && status !== 'active').map((status) => (
              <FilterChip
                key={status}
                label={`${statusLabel[status]} ${Number(counts[status] ?? 0)}`}
                active={filter === status}
                onClick={() => setFilter(status)}
              />
            ))}
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_auto] px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted">
              <span>CLIENT REQUEST</span>
              <span>RECEIVED</span>
            </div>
            {visibleQuotes.length === 0 && <p className="px-2 py-8 text-sm text-muted">No requests in this view.</p>}
            <ul className="divide-y divide-line">
              {visibleQuotes.map((quote) => (
                <li key={quote.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(quote.id)}
                    className={`grid w-full grid-cols-[1fr_auto] gap-3 rounded-xl px-3 py-3 text-left ${selectedId === quote.id ? 'bg-blue-50' : 'hover:bg-paper'}`}
                  >
                    <span>
                      <span className="font-semibold">{quote.customer_name}</span>
                      <span className="ml-2 text-xs text-muted">{quote.reference_code}</span>
                      <span className="mt-0.5 block text-sm text-muted">{quote.location}</span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{quote.items_count} cameras</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{inspectionLabel(quote.inspection_type)}</span>
                        <StatusBadge status={quote.status} />
                      </span>
                    </span>
                    <span className="text-xs text-muted">{timeAgo(quote.created_at)} ›</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
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
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? 'bg-night text-paper' : 'bg-white text-ink'}`}
    >
      {label}
    </button>
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
    setMediaIndex(0)
    setTechId(detail.assigned_technician_id ? String(detail.assigned_technician_id) : '')
  }, [detail])

  if (!detail) {
    return (
      <aside className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
        Select a request to see the layout, notes, technician schedule, and status.
      </aside>
    )
  }

  const media = detail.media[mediaIndex]
  const canPrice = detail.status === 'active' || detail.status === 'quoted'

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
    <aside className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <StatusBadge status={detail.status} />
            <span className="text-muted">{detail.reference_code}</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold">{detail.customer_name}</h2>
          <p className="text-sm text-muted">{detail.location}</p>
          <p className="text-xs text-muted">{detail.customer_phone} · {detail.customer_email}</p>
        </div>
      </div>

      <section>
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-muted">SUMMARY</h3>
        <div className="mt-2 rounded-xl bg-paper p-3 text-sm leading-6">
          {detail.message || `${inspectionLabel(detail.inspection_type)} inspection requested.`}
        </div>
      </section>

      <section>
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Quotation</h2>
        <div className="mt-2 space-y-2">
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
                <span className="block text-sm">Final {peso(item.final_unit_price, 2)}</span>
              )}
            </label>
          ))}
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
                  }),
                })
              })
            }
          >
            {detail.status === 'active' ? 'Save quotation' : 'Update quotation'}
          </Button>
        )}
        {detail.quoted_total && (
          <p className="mt-2 text-sm">
            Quoted total {peso(detail.quoted_total, 2)}. Down payment {detail.down_payment_percent}% is{' '}
            {peso(detail.down_payment_amount, 2)}.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted">LAYOUT FILE</h2>
        {detail.media.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {detail.inspection_type === 'ocular'
              ? 'Ocular request. A technician visits, so there is no layout file.'
              : 'No layout file was stored with this request.'}
          </p>
        ) : (
          <div className="mt-2">
            <MediaFrame file={media} />
            {detail.media.length > 1 && (
              <div className="mt-2 flex gap-2">
                {detail.media.map((file, index) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setMediaIndex(index)}
                    className={`rounded border px-2 py-1 text-xs ${index === mediaIndex ? 'border-copper' : 'border-line'}`}
                  >
                    {file.original_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Status</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {detail.status === 'pending' && (
            <Button disabled={busy !== null} onClick={() => changeStatus('active')}>
              Mark active
            </Button>
          )}
          {detail.status === 'active' && (
            <Button variant="ghost" disabled={busy !== null} onClick={() => changeStatus('pending')}>
              Return to pending
            </Button>
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
            <Button
              disabled={busy !== null}
              onClick={() =>
                void act('payment', async () => {
                  await api(`/admin/quotes/${detail.id}/payment`, { method: 'POST' })
                })
              }
            >
              Record 70% down payment
            </Button>
          )}
          {detail.status !== 'completed' && detail.status !== 'cancelled' && (
            <Button
              variant="danger"
              disabled={busy !== null}
              onClick={() => {
                if (window.confirm('Cancel this request?')) {
                  changeStatus('cancelled')
                }
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {detail.status === 'awaiting_payment' && detail.down_payment_received_at && (
          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
              event.preventDefault()
              changeStatus('scheduled', {
                installation_start_date: installStart,
                installation_end_date: installEnd,
              })
            }}
          >
            <p className="text-xs text-pine">Down payment recorded {formatWhen(detail.down_payment_received_at)}.</p>
            <label className="block text-xs">
              Installation start
              <input className={`${fieldClass} mt-1`} type="date" required value={installStart} onChange={(event) => setInstallStart(event.target.value)} />
            </label>
            <label className="block text-xs">
              Promised completion
              <input className={`${fieldClass} mt-1`} type="date" required value={installEnd} onChange={(event) => setInstallEnd(event.target.value)} />
            </label>
            <Button type="submit" disabled={busy !== null}>
              Schedule installation
            </Button>
          </form>
        )}
        {detail.status === 'scheduled' && (
          <Button className="mt-2" disabled={busy !== null} onClick={() => changeStatus('in_progress')}>
            Start installation
          </Button>
        )}
        {detail.status === 'in_progress' && (
          <Button
            className="mt-2"
            variant="pine"
            disabled={busy !== null}
            onClick={() => {
              if (window.confirm('Mark the project complete and start the 1-year warranty today?')) {
                changeStatus('completed')
              }
            }}
          >
            Complete project
          </Button>
        )}
      </section>

      {detail.warranty && (
        <section className="rounded-xl bg-foam p-3">
          <h2 className="text-xs tracking-[0.14em] text-pine uppercase">Warranty</h2>
          <p className="mt-1 text-sm">
            {detail.warranty.status === 'active' ? 'Active' : 'Expired'} from {formatWhen(detail.warranty.starts_at)} to{' '}
            {formatWhen(detail.warranty.ends_at)}.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Technician scheduler</h2>
        <p className="mt-1 text-sm text-muted">
          Assigned: {detail.assigned_technician_name ?? 'Unassigned'}
        </p>
        <form
          className="mt-2 space-y-2"
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
          <select className={fieldClass} required value={techId} onChange={(event) => setTechId(event.target.value)}>
            <option value="">Technician</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name}
              </option>
            ))}
          </select>
          <select className={fieldClass} value={eventType} onChange={(event) => setEventType(event.target.value as 'ocular' | 'installation')}>
            <option value="ocular">Ocular visit</option>
            <option value="installation">Installation</option>
          </select>
          <input className={fieldClass} type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
          <input className={fieldClass} type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
          <input className={fieldClass} placeholder="Schedule note" value={scheduleNotes} onChange={(event) => setScheduleNotes(event.target.value)} />
          <Button type="submit" variant="ghost" disabled={busy !== null || technicians.length === 0}>
            Add to calendar
          </Button>
        </form>
        <ul className="mt-3 space-y-2">
          {detail.schedules.map((event) => (
            <li key={event.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
              <span className="font-medium">{event.event_type === 'ocular' ? 'Ocular' : 'Installation'}</span>
              <span className="block text-xs text-muted">
                {event.technician_name} · {formatWhen(event.starts_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Notes history</h2>
        <ul className="mt-2 space-y-2">
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
          className="mt-2 space-y-2"
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
          <textarea className={`${fieldClass} min-h-20`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note" />
          <Button type="submit" variant="ghost" disabled={busy !== null || note.trim() === ''}>
            Save note
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-xs tracking-[0.14em] text-muted uppercase">Status history</h2>
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {detail.status_events.map((event) => (
            <li key={event.id}>
              {event.actor_name}: {event.from_status ? statusLabel[event.from_status] : 'New'} → {statusLabel[event.to_status]} ·{' '}
              {formatWhen(event.created_at)}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

function MediaFrame({ file }: { file: MediaFile | undefined }) {
  if (!file) {
    return null
  }
  if (file.kind === 'site_video') {
    return <video className="w-full rounded-lg bg-night" controls src={file.url} />
  }
  return <img className="max-h-56 w-full rounded-lg object-contain bg-night" src={file.url} alt={file.original_name} />
}
