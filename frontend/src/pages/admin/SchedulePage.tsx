import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Button, Eyebrow, cardClass, fieldClass, labelClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { dayKey, formatDay, formatWhen } from '../../lib/format'
import type { ScheduleEvent, Technician } from '../../types'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SchedulePage() {
  const today = new Date()
  const todayKey = dayKey(today)
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')

  const days = useMemo(() => monthDays(cursor.year, cursor.month), [cursor])

  useEffect(() => {
    const from = new Date(cursor.year, cursor.month, 1).toISOString()
    const to = new Date(cursor.year, cursor.month + 1, 1).toISOString()
    api<{ data: ScheduleEvent[] }>(`/admin/schedules?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((result) => setEvents(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The calendar could not be loaded.')))
  }, [cursor])

  useEffect(() => {
    api<{ data: Technician[] }>('/admin/technicians')
      .then((result) => setTechnicians(result.data))
      .catch(() => setTechnicians([]))
  }, [])

  const visible = selectedDay ? events.filter((event) => dayKey(new Date(event.starts_at)) === selectedDay) : events
  const label = new Date(cursor.year, cursor.month, 1).toLocaleString('en-PH', { month: 'long', year: 'numeric' })

  async function addTechnician(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const result = await api<{ data: Technician }>('/admin/technicians', {
        method: 'POST',
        body: JSON.stringify({ name, phone, specialty }),
      })
      setTechnicians((current) => [...current, result.data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setPhone('')
      setSpecialty('')
    } catch (saveError) {
      setError(errorText(saveError, 'The technician could not be added.'))
    }
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Eyebrow>Technician scheduler</Eyebrow>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{label}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" aria-label="Previous month" className="px-3" onClick={() => setCursor((current) => shiftMonth(current, -1))}>
            <Icon name="chevron-left" className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}>
            Today
          </Button>
          <Button variant="ghost" aria-label="Next month" className="px-3" onClick={() => setCursor((current) => shiftMonth(current, 1))}>
            <Icon name="chevron-right" className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className={`p-2 sm:p-4 ${cardClass}`}>
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-medium tracking-wide text-muted uppercase">
            {weekdays.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = dayKey(day)
              const inMonth = day.getMonth() === cursor.month
              const count = events.filter((event) => dayKey(new Date(event.starts_at)) === key).length
              return (
                <button
                  key={key + day.getMonth()}
                  type="button"
                  aria-pressed={selectedDay === key}
                  onClick={() => setSelectedDay((current) => (current === key ? null : key))}
                  className={`flex min-h-16 min-w-0 flex-col items-start justify-start rounded-lg border p-1.5 text-left text-sm transition sm:min-h-24 sm:p-2 ${
                    selectedDay === key ? 'border-copper bg-signal ring-1 ring-copper' : 'border-line hover:border-slate-300'
                  } ${inMonth ? 'bg-white text-ink' : 'bg-paper/70 text-slate-400'}`}
                >
                  <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs ${key === todayKey ? 'bg-copper font-semibold text-white' : ''}`}>
                    {day.getDate()}
                  </span>
                  {count > 0 && (
                    <span className="mt-1 block w-full truncate rounded bg-tide px-1 py-0.5 text-[11px] font-medium text-tide-ink sm:px-1.5">
                      {count}<span className="hidden sm:inline"> booked</span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-4">
          <section className={`p-4 ${cardClass}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">{selectedDay ? `Events on ${formatDay(selectedDay)}` : 'Events this month'}</h2>
              {selectedDay && (
                <button type="button" className="text-xs font-semibold text-copper" onClick={() => setSelectedDay(null)}>
                  Show all
                </button>
              )}
            </div>
            <ul className="mt-3 space-y-3">
              {visible.length === 0 && (
                <li className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-muted">Nothing scheduled.</li>
              )}
              {visible.map((event) => (
                <li key={event.id} className="border-b border-line pb-3 text-sm last:border-0 last:pb-0">
                  <p className="font-semibold">
                    {event.event_type === 'ocular' ? 'Ocular' : 'Installation'} · {event.technician_name}
                  </p>
                  <p className="text-muted">
                    {event.customer_name} · {event.location}
                  </p>
                  <p className="text-xs text-muted">{formatWhen(event.starts_at)}</p>
                  {event.quote_request_id && (
                    <Link to={`/admin?quote=${event.quote_request_id}`} className="font-mono text-xs font-medium text-copper hover:text-copper-dark">
                      Open {event.reference_code}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <section className={`p-4 ${cardClass}`}>
            <h2 className="font-bold">Technicians</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {technicians.length === 0 && <li className="text-muted">No technicians yet. Add your first one below.</li>}
              {technicians.map((technician) => (
                <li key={technician.id} className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tide text-[11px] font-bold text-tide-ink">
                    {technician.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    {technician.name}
                    {technician.specialty ? <span className="text-muted"> — {technician.specialty}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={addTechnician} className="mt-4 space-y-3 border-t border-line pt-4">
              <label className={labelClass}>
                Name
                <input className={`${fieldClass} mt-1`} required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass}>
                  Phone
                  <input className={`${fieldClass} mt-1`} value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
                <label className={labelClass}>
                  Specialty
                  <input className={`${fieldClass} mt-1`} value={specialty} onChange={(event) => setSpecialty(event.target.value)} />
                </label>
              </div>
              <Button type="submit" variant="ghost" className="w-full">
                <Icon name="plus" className="h-4 w-4" />
                Add technician
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

function monthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function shiftMonth(cursor: { year: number; month: number }, delta: number) {
  const next = new Date(cursor.year, cursor.month + delta, 1)
  return { year: next.getFullYear(), month: next.getMonth() }
}
