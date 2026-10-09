import { ServiceGrid, SurveyBanner } from '../components/ServiceGrid'

export function ServicesPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-xs font-semibold tracking-[0.18em] text-copper">WHAT WE DO</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Complete surveillance solutions, installed right
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          From single-camera homes to multi-site enterprise deployments — we design, install, and support every system we build.
        </p>
        <div className="mt-10">
          <ServiceGrid />
        </div>
      </section>
      <SurveyBanner />
    </div>
  )
}
