import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, fieldClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { dayKey, formatWhen } from '../../lib/format'
import type { ScheduleEvent, Technician } from '../../types'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SchedulePage() {
  const today = new Date()
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
    <div className="px-4 py-6 lg:px-6">
      <p className="text-xs tracking-[0.16em] text-copper uppercase">Technician scheduler</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl tracking-wide uppercase">{label}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setCursor((current) => shiftMonth(current, -1))}>
            Previous
          </Button>
          <Button variant="ghost" onClick={() => setCursor((current) => shiftMonth(current, 1))}>
            Next
          </Button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-line bg-white p-3">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-wide text-muted uppercase">
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
                  onClick={() => setSelectedDay(key)}
                  className={`min-h-16 rounded-lg border px-2 py-1 text-left text-sm ${
                    selectedDay === key ? 'border-copper bg-sand' : 'border-transparent'
                  } ${inMonth ? 'text-ink' : 'text-muted/50'}`}
                >
                  {day.getDate()}
                  {count > 0 && <span className="mt-1 block text-[11px] text-copper">{count} booked</span>}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-sm font-semibold">{selectedDay ? `Events on ${selectedDay}` : 'Events this month'}</h2>
            <ul className="mt-3 space-y-3">
              {visible.length === 0 && <li className="text-sm text-muted">Nothing scheduled.</li>}
              {visible.map((event) => (
                <li key={event.id} className="border-b border-line pb-3 text-sm last:border-0">
                  <p className="font-medium">
                    {event.event_type === 'ocular' ? 'Ocular' : 'Installation'} · {event.technician_name}
                  </p>
                  <p className="text-muted">
                    {event.customer_name} · {event.location}
                  </p>
                  <p className="text-xs text-muted">{formatWhen(event.starts_at)}</p>
                  {event.quote_request_id && (
                    <Link to={`/admin?quote=${event.quote_request_id}`} className="text-xs font-semibold text-copper">
                      Open {event.reference_code}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-sm font-semibold">Technicians</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {technicians.map((technician) => (
                <li key={technician.id}>
                  {technician.name}
                  {technician.specialty ? <span className="text-muted"> — {technician.specialty}</span> : null}
                </li>
              ))}
            </ul>
            <form onSubmit={addTechnician} className="mt-3 space-y-2">
              <input className={fieldClass} required placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
              <input className={fieldClass} placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <input className={fieldClass} placeholder="Specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)} />
              <Button type="submit" variant="ghost">
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
