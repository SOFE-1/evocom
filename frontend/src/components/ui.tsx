import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary: 'bg-copper text-white hover:bg-copper-dark',
  night: 'bg-night text-white hover:bg-ink',
  pine: 'bg-pine text-white hover:bg-pine/90',
  ghost: 'border border-line bg-white text-ink hover:border-slate-300',
  danger: 'border border-red-200 bg-white text-red-700 hover:border-red-400',
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
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const fieldClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-copper'
