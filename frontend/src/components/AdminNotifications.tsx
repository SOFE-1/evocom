import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { inspectionLabel, timeAgo } from '../lib/format'
import type { InspectionType } from '../types'
import { Icon } from './Icon'

type Notice = {
  id: number
  quote_request_id: number
  read_at: string | null
  created_at: string
  customer_name: string | null
  reference_code: string | null
  inspection_type: InspectionType | null
}

export function AdminNotifications() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notice[]>([])
  const [unread, setUnread] = useState(0)

  function load() {
    api<{ data: Notice[]; meta: { unread_count: number } }>('/admin/notifications')
      .then((result) => {
        setItems(result.data)
        setUnread(result.meta.unread_count)
      })
      .catch(() => undefined)
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 60000)
    return () => window.clearInterval(timer)
  }, [])

  async function markRead(notice: Notice) {
    if (notice.read_at) {
      return
    }
    const result = await api<{ data: Notice; meta: { unread_count: number } }>(`/admin/notifications/${notice.id}/read`, {
      method: 'POST',
    })
    setUnread(result.meta.unread_count)
    setItems((current) => current.map((item) => (item.id === notice.id ? result.data : item)))
  }

  async function markAll() {
    const result = await api<{ data: Notice[]; meta: { unread_count: number } }>('/admin/notifications/read', {
      method: 'POST',
    })
    setItems(result.data)
    setUnread(result.meta.unread_count)
  }

  return (
    <div className="relative print:hidden">
      <button
        type="button"
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-line text-ink"
        aria-expanded={open}
        aria-label={unread > 0 ? `${unread} unread request notifications` : 'Request notifications'}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 font-mono text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-line bg-white p-3 shadow-lift">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">New requests</p>
            {unread > 0 && (
              <button type="button" className="text-xs font-semibold text-copper" onClick={() => void markAll()}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No requests yet.</p>
          ) : (
            <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto">
              {items.map((notice) => (
                <li key={notice.id}>
                  <Link
                    to={`/admin?quote=${notice.quote_request_id}`}
                    onClick={() => {
                      setOpen(false)
                      void markRead(notice)
                    }}
                    className={`block rounded-lg px-2 py-2 text-sm hover:bg-paper ${notice.read_at ? 'text-muted' : 'bg-signal/60'}`}
                  >
                    <span className="font-semibold text-ink">{notice.customer_name}</span>
                    <span className="mt-0.5 block font-mono text-xs">{notice.reference_code}</span>
                    <span className="mt-0.5 block text-xs">
                      {notice.inspection_type ? inspectionLabel(notice.inspection_type) : 'Request'} · {timeAgo(notice.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
