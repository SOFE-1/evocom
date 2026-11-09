import { useEffect, useState } from 'react'
import { Button, Eyebrow, SectionLabel, cardClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { formatDay, peso } from '../../lib/format'

type SalesPayment = {
  id: number
  paid_on: string
  amount: string
  method: string
  reference_code: string | null
  customer_name: string | null
}

type SalesReport = {
  year: number
  month: number
  total_sales: string
  payments_received: string
  outstanding_balances: string
  completed_jobs: number
  transactions: number
  payments: SalesPayment[]
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function SalesPage() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit' }).format(new Date())
  const [year, setYear] = useState(today.slice(0, 4))
  const [month, setMonth] = useState(String(Number(today.slice(5, 7))))
  const [report, setReport] = useState<SalesReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  function load(nextYear = year, nextMonth = month) {
    api<{ data: SalesReport }>(`/admin/reports/sales?year=${nextYear}&month=${nextMonth}`)
      .then((result) => setReport(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The sales report could not be loaded.')))
  }

  useEffect(() => {
    load()
  }, [])

  function exportCsv() {
    if (!report) {
      return
    }
    const rows = [
      ['Date', 'Customer', 'Reference', 'Method', 'Amount'],
      ...report.payments.map((payment) => [
        payment.paid_on,
        payment.customer_name ?? '',
        payment.reference_code ?? '',
        payment.method,
        payment.amount,
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `evocom-sales-${report.year}-${String(report.month).padStart(2, '0')}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Eyebrow>Collected payments</Eyebrow>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Monthly sales</h1>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <label className="text-sm">
            <span className="sr-only">Month</span>
            <select
              className="rounded-lg border border-line bg-white px-3 py-2"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value)
                load(year, event.target.value)
              }}
            >
              {months.map((label, index) => (
                <option key={label} value={index + 1}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">Year</span>
            <input
              className="w-24 rounded-lg border border-line bg-white px-3 py-2"
              inputMode="numeric"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              onBlur={() => load()}
            />
          </label>
          <Button type="button" variant="ghost" onClick={() => window.print()}>Print</Button>
          <Button type="button" variant="ghost" onClick={exportCsv} disabled={!report}>Export CSV</Button>
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Sales are payments recorded in the selected month. Unpaid quotations are not counted as collected sales. Outstanding balance is what remains on quotations finalized in that month.
      </p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {report && (
        <>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Total sales" value={peso(report.total_sales, 2)} />
            <Stat label="Payments received" value={peso(report.payments_received, 2)} />
            <Stat label="Outstanding balances" value={peso(report.outstanding_balances, 2)} />
            <Stat label="Completed jobs" value={String(report.completed_jobs)} />
            <Stat label="Transactions" value={String(report.transactions)} />
          </dl>
          <section className={`mt-6 overflow-hidden ${cardClass}`}>
            <div className="border-b border-line px-4 py-3">
              <SectionLabel>Payments in {months[report.month - 1]} {report.year}</SectionLabel>
            </div>
            {report.payments.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">No payments were recorded in this month.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Reference</th>
                    <th className="px-4 py-2 font-medium">Method</th>
                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-line">
                      <td className="px-4 py-2">{formatDay(payment.paid_on)}</td>
                      <td className="px-4 py-2">{payment.customer_name}</td>
                      <td className="px-4 py-2 font-mono text-xs">{payment.reference_code}</td>
                      <td className="px-4 py-2">{payment.method}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{peso(payment.amount, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`px-4 py-3 ${cardClass}`}>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-bold tabular-nums">{value}</dd>
    </div>
  )
}
