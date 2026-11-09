import type { ReactNode } from 'react'
import { Eyebrow } from './ui'

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="absolute -top-40 right-0 -z-10 h-96 w-[40rem] max-w-full rounded-full bg-copper/25 blur-3xl" />
      <div className="shell py-12 lg:py-16">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{children}</div>}
      </div>
    </section>
  )
}
