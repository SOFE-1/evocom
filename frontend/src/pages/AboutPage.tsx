import { Icon, type IconName } from '../components/Icon'
import { ServiceGrid } from '../components/ServiceGrid'
import { Eyebrow } from '../components/ui'
import { PageMeta } from '../components/PageMeta'
import { company } from '../config'

const points: Array<{ title: string; body: string; icon: IconName }> = [
  { title: 'Site review', body: 'We look at the property before recommending cameras.', icon: 'shield-check' },
  { title: 'Layout', body: 'Camera placement follows the areas you want covered.', icon: 'radar' },
  { title: 'Installation', body: 'The quotation can include labor, cabling, and recording equipment.', icon: 'wrench' },
  { title: 'Maintenance', body: 'Checks and repairs after the system is installed.', icon: 'users' },
]

export function AboutPage() {
  return (
    <div>
      <PageMeta
        title="About Evocom Information Technology Services"
        description="Evocom Information Technology Services installs CCTV systems for homes and businesses in Rodriguez, Rizal. Quotations cover cameras, labor, and materials after a site review."
      />
      <section className="shell grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <div className="viewfinder relative overflow-hidden rounded-2xl shadow-lift">
          <img src="/media/hero.jpg" alt="Technician working on a camera" className="aspect-[4/3] w-full object-cover" />
        </div>
        <div>
          <Eyebrow>About us</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">CCTV installation in {company.city}</h1>
          <p className="mt-5 leading-7 text-muted">
            {company.legalName} installs CCTV and security camera systems for homes and businesses in {company.city}. A request can cover cameras from the catalog, installation labor, or both.
          </p>
          <p className="mt-3 leading-7 text-muted">
            Final prices, cable lengths, and material quantities are confirmed after the site is reviewed. The quotation you approve is the one used for payment and installation.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-signal text-copper">
                  <Icon name={point.icon} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{point.title}</p>
                  <p className="text-sm text-muted">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="services" className="scroll-mt-24 border-y border-line bg-white">
        <div className="shell py-16">
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Services we install and support</h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Evocom designs, supplies, and installs surveillance systems for homes and businesses in Rodriguez, Rizal. The same team that surveys the site also installs the cameras and stays available for maintenance.
          </p>
          <div className="mt-10">
            <ServiceGrid />
          </div>
        </div>
      </section>
    </div>
  )
}
