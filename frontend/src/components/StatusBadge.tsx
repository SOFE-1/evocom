import type { QuoteStatus } from '../types'
import { statusLabel } from '../types'

const tones: Record<QuoteStatus, string> = {
  pending: 'bg-sand text-ink',
  active: 'bg-foam text-pine',
  quoted: 'bg-signal text-tide-ink',
  awaiting_payment: 'bg-signal text-tide-ink',
  scheduled: 'bg-tide text-tide-ink',
  in_progress: 'bg-copper text-paper',
  completed: 'bg-pine text-paper',
  cancelled: 'bg-line text-muted',
}

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[status]}`}>
      {statusLabel[status]}
    </span>
  )
}
