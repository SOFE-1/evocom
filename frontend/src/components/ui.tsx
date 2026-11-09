import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from './Icon'

const variants = {
  primary: 'bg-copper text-white shadow-sm shadow-copper/25 hover:bg-copper-dark',
  night: 'bg-night text-white hover:bg-ink',
  pine: 'bg-pine text-white hover:bg-pine/90',
  ghost: 'border border-line bg-white text-ink hover:border-slate-300 hover:bg-paper',
  danger: 'border border-red-200 bg-white text-red-700 hover:border-red-400 hover:bg-red-50',
  glass: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
  white: 'bg-white text-copper-dark hover:bg-blue-50',
}

export function buttonClass(variant: keyof typeof variants = 'primary', className = '') {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`
}

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  children: ReactNode
}) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  )
}

export const fieldClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-copper focus:ring-3 focus:ring-copper/15'

export const labelClass = 'block text-sm font-medium text-ink'

export const cardClass = 'rounded-2xl border border-line bg-white shadow-card'

export function Eyebrow({
  children,
  tone = 'dark',
  className = '',
}: {
  children: ReactNode
  tone?: 'dark' | 'light' | 'muted'
  className?: string
}) {
  const color = { dark: 'text-copper', light: 'text-blue-300', muted: 'text-muted' }[tone]
  return <p className={`font-mono text-xs font-medium tracking-[0.16em] uppercase ${color} ${className}`}>{children}</p>
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted uppercase">{children}</h3>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-slate-200/70 ${className}`} />
}

export function QtyStepper({
  quantity,
  onChange,
  label,
}: {
  quantity: number
  onChange: (next: number) => void
  label: string
}) {
  return (
    <span className="inline-flex items-center rounded-lg border border-line bg-white">
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-l-lg text-muted transition hover:bg-paper hover:text-ink"
        aria-label={`Decrease ${label} quantity`}
        onClick={() => onChange(quantity - 1)}
      >
        <Icon name="minus" className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-7 text-center font-mono text-sm font-medium">{quantity}</span>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-r-lg text-muted transition hover:bg-paper hover:text-ink"
        aria-label={`Increase ${label} quantity`}
        onClick={() => onChange(quantity + 1)}
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}
