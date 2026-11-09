import { useEffect, useState } from 'react'

const clockFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return clockFormat.format(now).replace(',', '')
}

function Feed({ src, label, className = '' }: { src: string; label: string; className?: string }) {
  return (
    <div className={`viewfinder relative overflow-hidden rounded-lg bg-ink [--vf-inset:8px] ${className}`}>
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="absolute bottom-2.5 left-3 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-white">
        {label}
      </span>
    </div>
  )
}

export function MonitorWall() {
  const stamp = useClock()

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between px-1.5 pb-2.5 font-mono text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-2 font-medium tracking-wide text-white">
          <span className="h-2 w-2 animate-rec rounded-full bg-red-500" />
          REC
        </span>
        <span className="tabular-nums">{stamp}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Feed src="/media/wall.jpg" label="CAM 01" className="col-span-2 aspect-[16/9]" />
        <Feed src="/media/cam-lot.jpg" label="CAM 02" className="aspect-[16/9]" />
        <Feed src="/media/hero.jpg" label="CAM 03" className="aspect-[16/9]" />
      </div>
    </div>
  )
}
