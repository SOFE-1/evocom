export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const word = tone === 'light' ? 'text-white' : 'text-ink'

  return (
    <span className={`flex items-center gap-2.5 ${word}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-copper text-[13px] font-bold tracking-tight text-white">
        EC
      </span>
      <span className="text-[1.35rem] font-semibold tracking-tight">Evocom</span>
    </span>
  )
}
