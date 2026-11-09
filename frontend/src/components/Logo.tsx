import { company } from '../config'

export function Logo({ tone = 'dark', sub }: { tone?: 'dark' | 'light'; sub?: string }) {
  const mark = (
    <img src="/brand/evocom-logo.png" alt="" width={249} height={265} className="block h-10 w-auto" />
  )

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {tone === 'light' ? <span className="shrink-0 rounded-lg bg-white p-1">{mark}</span> : <span className="shrink-0">{mark}</span>}
      <span className="min-w-0 leading-tight">
        <span className="block text-[13px] font-bold tracking-tight text-copper sm:text-sm">{company.wordmark}</span>
        {sub && <span className="mt-0.5 block text-[11px] font-medium tracking-wide text-slate-400">{sub}</span>}
      </span>
    </span>
  )
}
