import { useState, type FormEvent } from 'react'
import { Button, SectionLabel, cardClass, fieldClass, labelClass } from './ui'
import { errorText } from '../lib/api'
import { formatDay, peso } from '../lib/format'
import type { PaymentRecord, PaymentStatus, QuoteStatus } from '../types'

const methods = ['Cash', 'Bank transfer', 'GCash', 'Maya', 'Cheque', 'Credit card'] as const

export type PaymentAccount = {
  id: number
  customer_name: string
  reference_code: string
  payment_status: PaymentStatus
  amount_paid: string
  amount_due: string | null
  balance_remaining: string | null
  down_payment_percent?: number
  down_payment_amount?: string | null
  payments: PaymentRecord[]
  status?: QuoteStatus
}

export type PaymentInput = {
  amount: string
  paid_on: string
  method: string
  remarks: string | null
  amount_due?: string
}

export function PaymentStatusBadge({ status, labelled = false }: { status: PaymentStatus; labelled?: boolean }) {
  const styles: Record<PaymentStatus, string> = {
    pending: 'bg-amber-100 text-amber-900',
    partial: 'bg-blue-100 text-blue-800',
    paid: 'bg-emerald-100 text-emerald-800',
  }
  const labels: Record<PaymentStatus, string> = {
    pending: 'Pending',
    partial: 'Partial',
    paid: 'Paid',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labelled ? `Payment: ${labels[status]}` : labels[status]}
    </span>
  )
}

function todayInput(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function PaymentHistoryPanel({
  account,
  onRecord,
  bare = false,
}: {
  account: PaymentAccount
  onRecord: (input: PaymentInput) => Promise<void>
  bare?: boolean
}) {
  const [amount, setAmount] = useState('')
  const [paidOn, setPaidOn] = useState(todayInput)
  const [method, setMethod] = useState<(typeof methods)[number]>('Cash')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const records = [...account.payments].reverse()
  const locked =
    account.status === 'cancelled'
      ? 'Cancelled requests cannot take payments.'
      : account.status === 'pending' || account.status === 'active' || account.amount_due === null
        ? 'Save a finalized quotation before recording a payment.'
        : account.balance_remaining !== null && Number(account.balance_remaining) <= 0
          ? 'This quotation is fully paid.'
          : null
  const due = Number(account.amount_due ?? 0)
  const paidPercent = due > 0 ? Math.min(100, (Number(account.amount_paid) / due) * 100) : 0
  const downPercent = account.down_payment_percent ?? 70

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a payment amount greater than zero.')
      return
    }
    const remaining = account.balance_remaining === null ? null : Number(account.balance_remaining)
    if (remaining !== null && value > remaining + 0.001) {
      setError(`The payment cannot exceed the remaining balance of ${peso(account.balance_remaining, 2)}.`)
      return
    }

    setBusy(true)
    try {
      await onRecord({
        amount,
        paid_on: paidOn,
        method,
        remarks: remarks.trim() === '' ? null : remarks.trim(),
      })
      setAmount('')
      setRemarks('')
    } catch (submitError) {
      setError(errorText(submitError, 'The payment could not be saved.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={bare ? '' : `p-4 ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Payment history</SectionLabel>
        <PaymentStatusBadge status={account.payment_status} />
      </div>
      <p className="mt-1 text-sm font-semibold">{account.customer_name}</p>
      <p className="font-mono text-xs text-muted">{account.reference_code}</p>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Quotation total', account.amount_due],
          ['Paid', account.amount_paid],
          ['Balance', account.balance_remaining],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg bg-paper px-2.5 py-2">
            <dt className="text-[11px] font-medium text-muted">{label}</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums" title={peso(value, 2)}>{peso(value, 2)}</dd>
          </div>
        ))}
      </dl>
      {due > 0 && (
        <div className="relative mt-3 h-2 rounded-full bg-line" title={`${Math.round(paidPercent)}% paid`}>
          <div className="h-full rounded-full bg-copper transition-all" style={{ width: `${paidPercent}%` }} />
          <span className="absolute -top-0.5 h-3 w-0.5 bg-ink/40" style={{ left: `${downPercent}%` }} title={`${downPercent}% down payment`} />
        </div>
      )}
      {account.down_payment_amount && (
        <p className="mt-2 text-xs leading-5 text-muted">
          {Number(account.amount_paid) >= Number(account.down_payment_amount)
            ? `The ${downPercent}% down payment of ${peso(account.down_payment_amount, 2)} is covered by recorded payments.`
            : `Installation can be scheduled after the ${downPercent}% down payment of ${peso(account.down_payment_amount, 2)} is covered by recorded payments.`}
        </p>
      )}

      {records.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-muted">
          No payment has been recorded. Status stays pending until one is saved.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {records.map((payment) => (
            <li key={payment.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums">{peso(payment.amount, 2)}</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {formatDay(payment.paid_on)} · {payment.method}
              </p>
              {payment.remarks && <p className="mt-1 text-xs text-slate-600">{payment.remarks}</p>}
            </li>
          ))}
        </ul>
      )}

      {locked ? (
        <p className="mt-4 rounded-lg bg-paper px-3 py-3 text-sm text-slate-700">{locked}</p>
      ) : (
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <SectionLabel>Record a payment</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Amount
            <input
              className={`${fieldClass} mt-1`}
              inputMode="decimal"
              required
              max={account.balance_remaining ?? undefined}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <span className="mt-2 flex flex-wrap gap-2">
              {account.balance_remaining !== null && Number(account.balance_remaining) > 0 && (
                <button
                  type="button"
                  className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:border-copper hover:text-copper"
                  onClick={() => setAmount(Number(account.balance_remaining).toFixed(2))}
                >
                  Remaining {peso(account.balance_remaining, 2)}
                </button>
              )}
              {account.down_payment_amount && Number(account.amount_paid) < Number(account.down_payment_amount) && (
                <button
                  type="button"
                  className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:border-copper hover:text-copper"
                  onClick={() => {
                    const stillDue = Number(account.down_payment_amount) - Number(account.amount_paid)
                    const cap = account.balance_remaining === null ? stillDue : Math.min(stillDue, Number(account.balance_remaining))
                    setAmount(Math.max(cap, 0).toFixed(2))
                  }}
                >
                  {downPercent}% down payment
                </button>
              )}
            </span>
          </label>
          <label className={labelClass}>
            Payment date
            <input
              className={`${fieldClass} mt-1`}
              type="date"
              required
              max={todayInput()}
              value={paidOn}
              onChange={(event) => setPaidOn(event.target.value)}
            />
          </label>
        </div>
        <label className={labelClass}>
          Method
          <select className={`${fieldClass} mt-1`} value={method} onChange={(event) => setMethod(event.target.value as (typeof methods)[number])}>
            {methods.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Description or remarks
          <textarea
            className={`${fieldClass} mt-1 min-h-16`}
            maxLength={500}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Down payment, balance, or other note"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Saving…' : 'Save payment'}
        </Button>
      </form>
      )}
    </section>
  )
}
