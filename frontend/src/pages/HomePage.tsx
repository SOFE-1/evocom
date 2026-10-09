import { Link } from 'react-router-dom'
import { stats } from '../config'
import { ServiceGrid, SurveyBanner } from '../components/ServiceGrid'

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#07111f]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-300">CCTV & SECURITY SOLUTIONS</p>
            <h1 className="mt-4 max-w-xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              See everything.
              <span className="block text-blue-400">Miss nothing.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Evocom installs professional CCTV and IP surveillance systems for homes and businesses — protecting what matters most, around the clock.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact#request" className="rounded-lg bg-copper px-5 py-3 text-sm font-semibold text-white hover:bg-copper-dark">
                Get a Free Site Survey
              </Link>
              <Link to="/products" className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Browse Products
              </Link>
            </div>
          </div>
          <div className="relative">
            <img src="/media/hero.jpg" alt="Technician working on a camera" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              LIVE · CAM 04
            </span>
            <div className="absolute right-4 bottom-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg">
              <p className="text-lg font-bold">24/7</p>
              <p className="text-xs text-muted">Continuous HD recording</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#07111f] border-t border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-white/10 px-5 py-6 text-center even:border-l lg:border-l lg:first:border-l-0">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-semibold tracking-[0.18em] text-copper">WHAT WE DO</p>
        <h2 className="mt-3 max-w-xl text-4xl font-bold tracking-tight">Complete surveillance solutions, installed right</h2>
        <p className="mt-3 max-w-2xl text-muted">
          From single-camera homes to multi-site enterprise deployments — we design, install, and support every system we build.
        </p>
        <div className="mt-8">
          <ServiceGrid />
        </div>
      </section>
      <SurveyBanner />
    </div>
  )
}
