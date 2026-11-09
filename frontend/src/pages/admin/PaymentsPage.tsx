import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { PaymentHistoryPanel, PaymentStatusBadge } from '../../components/PaymentHistoryPanel'
import { StatusBadge } from '../../components/StatusBadge'
import { Eyebrow, Skeleton, cardClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { formatDay, peso } from '../../lib/format'
import type { PaymentStatus, QuoteDetail, QuoteSummary } from '../../types'

type Group = 'pending' | 'active'
type StatusFilter = 'all' | PaymentStatus
type SortKey = 'latest' | 'balance' | 'name'

type PaymentList = {
  data: QuoteSummary[]
  meta: { group: Group; counts: { pending: number; active: number } }
}

export function PaymentsPage() {
  const [group, setGroup] = useState<Group>('pending')
  const [rows, setRows] = useState<QuoteSummary[]>([])
  const [counts, setCounts] = useState({ pending: 0, active: 0 })
  const [loaded, setLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<QuoteDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('latest')
  const [version, setVersion] = useState(0)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    api<PaymentList>(`/admin/payments?group=${group}`)
      .then((result) => {
        if (!cancelled) {
          setRows(result.data)
          setCounts(result.meta.counts)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(errorText(loadError, 'Payment history could not be loaded.'))
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
  }, [group, version])

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
          setError(errorText(loadError, 'That client could not be opened.'))
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = rows.filter((row) => {
      if (statusFilter !== 'all' && row.payment_status !== statusFilter) {
        return false
      }
      if (needle === '') {
        return true
      }
      return [row.customer_name, row.reference_code, row.customer_phone, row.location]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
    return filtered.slice().sort((left, right) => {
      if (sortKey === 'name') {
        return left.customer_name.localeCompare(right.customer_name)
      }
      if (sortKey === 'balance') {
        return Number(right.balance_remaining ?? 0) - Number(left.balance_remaining ?? 0)
      }
      const leftDate = left.latest_payment_on ?? left.created_at
      const rightDate = right.latest_payment_on ?? right.created_at
      return rightDate.localeCompare(leftDate)
    })
  }, [query, rows, sortKey, statusFilter])

  const totals = visible.reduce(
    (sum, row) => ({
      due: sum.due + Number(row.amount_due ?? 0),
      paid: sum.paid + Number(row.amount_paid),
      balance: sum.balance + Number(row.balance_remaining ?? 0),
    }),
    { due: 0, paid: 0, balance: 0 },
  )

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Eyebrow>Client payments</Eyebrow>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Payment history</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Pending clients still have a balance. Active clients already have at least one payment on file. A partial payment can appear in both lists.
      </p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 inline-flex rounded-xl border border-line bg-white p-1 text-sm shadow-card">
        <GroupButton label="Pending clients" count={counts.pending} active={group === 'pending'} onClick={() => { setGroup('pending'); setLoaded(false) }} />
        <GroupButton label="Active clients" count={counts.active} active={group === 'active'} onClick={() => { setGroup('active'); setLoaded(false) }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="h-10 min-w-56 flex-1 rounded-lg border border-line bg-white px-3 text-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search client, reference, phone, or site"
          aria-label="Search payment history"
        />
        {(['all', 'pending', 'partial', 'paid'] as const).map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${statusFilter === status ? 'border-copper bg-signal text-copper' : 'border-line bg-white text-ink hover:bg-paper'}`}
          >
            {status === 'all' ? 'All statuses' : status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}
        <select
          className="h-10 rounded-lg border border-line bg-white px-3 text-sm"
          aria-label="Sort payment history"
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
        >
          <option value="latest">Latest payment</option>
          <option value="balance">Highest balance</option>
          <option value="name">Client name</option>
        </select>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Amount due" value={peso(totals.due, 2)} />
        <Stat label="Collected" value={peso(totals.paid, 2)} />
        <Stat label="Outstanding" value={peso(totals.balance, 2)} highlight />
      </dl>
      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className={`panel-scroll relative max-h-[calc(100dvh-16rem)] overflow-auto ${cardClass}`}>
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-line bg-white font-mono text-[11px] tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 text-right font-medium">Due</th>
                <th className="px-4 py-3 text-right font-medium">Paid</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Latest</th>
              </tr>
            </thead>
            <tbody>
              {!loaded && (
                <tr>
                  <td colSpan={6} className="space-y-3 px-4 py-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              )}
              {loaded && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                    <Icon name="receipt" className="mx-auto mb-2 h-7 w-7 text-slate-400" />
                    No clients match this list.
                  </td>
                </tr>
              )}
              {visible.map((row) => (
                <tr
                  key={row.id}
                  className={`cursor-pointer border-b border-line transition last:border-0 ${selectedId === row.id ? 'bg-signal' : 'hover:bg-paper'}`}
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="px-4 py-3">
                    <button type="button" className="text-left font-semibold">
                      {row.customer_name}
                    </button>
                    <span className="block font-mono text-xs whitespace-nowrap text-muted">{row.reference_code}</span>
                    <span className="mt-1 block">
                      <StatusBadge status={row.status} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{peso(row.amount_due, 2)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">{peso(row.amount_paid, 2)}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums">{peso(row.balance_remaining, 2)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={row.payment_status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    <span className="block">{row.latest_payment_on ? formatDay(row.latest_payment_on) : '—'}</span>
                    <span className="block text-xs">{row.payments_count} {row.payments_count === 1 ? 'payment' : 'payments'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div ref={detailRef} className="min-w-0 scroll-mt-16">
          {detail ? (
            <PaymentHistoryPanel
              account={detail}
              onRecord={async (input) => {
                const saved = await api<{ data: QuoteDetail }>(`/admin/quotes/${detail.id}/payments`, {
                  method: 'POST',
                  body: JSON.stringify(input),
                })
                setDetail(saved.data)
                setVersion((value) => value + 1)
              }}
            />
          ) : (
            <aside className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-muted">
              <Icon name="receipt" className="mx-auto mb-2 h-7 w-7 text-slate-400" />
              Select a client to review the payment timeline and record a payment.
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`px-4 py-3.5 last:col-span-2 lg:last:col-span-1 ${cardClass}`}>
      <dt className="font-mono text-[11px] font-medium tracking-[0.12em] text-muted uppercase">{label}</dt>
      <dd className={`mt-1 truncate font-display text-2xl font-bold tabular-nums ${highlight ? 'text-copper' : ''}`}>{value}</dd>
    </div>
  )
}

function GroupButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 font-medium transition ${active ? 'bg-copper text-white' : 'text-ink hover:bg-paper'}`}
    >
      {label}
      <span className={`ml-2 rounded-full px-1.5 font-mono text-xs ${active ? 'bg-white/20' : 'bg-paper'}`}>{count}</span>
    </button>
  )
}
