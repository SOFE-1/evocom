export function peso(value: number | string | null | undefined, digits = 0): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) {
    return '—'
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(delta / 60000)
  if (Number.isNaN(minutes)) {
    return ''
  }
  if (minutes < 1) {
    return 'Just now'
  }
  if (minutes < 60) {
    return `${minutes} min ago`
  }
  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? '' : 's'} ago`
  }
  const days = Math.round(hours / 24)
  if (days === 1) {
    return 'Yesterday'
  }
  return formatDay(iso)
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(iso))
}

export function dayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function inspectionLabel(type: 'ocular' | 'non_ocular'): string {
  return type === 'ocular' ? 'Ocular' : 'Non-ocular'
}
