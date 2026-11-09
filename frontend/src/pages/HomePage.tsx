import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productPhoto } from '../catalog'
import { Icon } from '../components/Icon'
import { MonitorWall } from '../components/MonitorWall'
import { SurveyBanner } from '../components/ServiceGrid'
import { Eyebrow, buttonClass } from '../components/ui'
import { PageMeta } from '../components/PageMeta'
import { productTypes, terms } from '../config'
import { api } from '../lib/api'
import { priceRange } from '../lib/format'
import type { Product } from '../types'

const sampleCopy: Record<string, string> = {
  'Bullet Camera': 'Long-range outdoor coverage',
  'Dome Camera': 'Indoor and outdoor, vandal-proof',
  'PTZ Camera': 'Pan, tilt, and zoom with auto-tracking',
  'Turret Camera': 'Versatile fixed coverage',
  'Multi-Sensor Camera': '360° panoramic view',
}

const steps = [
  {
    title: 'Choose your cameras',
    body: 'Add models to your quote cart, or skip this and let us recommend a setup.',
  },
  {
    title: 'We inspect the site',
    body: 'A specialist visits on site, or reviews the photos and videos you send.',
  },
  {
    title: 'Confirm your quotation',
    body: `You see final prices in PHP before you decide. A ${terms.downPaymentPercent}% down payment books the installation.`,
  },
  {
    title: 'Installed and covered',
    body: `Our team installs the system, and your ${terms.warrantyYears}-year warranty starts on completion.`,
  },
]

const assurances = ['No payment to request a quote', `${terms.warrantyYears}-year warranty on a completed, paid installation`]

function sampleFor(products: Product[], type: string): Product | undefined {
  const matches = products.filter((product) => product.category === type)
  return matches.find((product) => product.brand === 'Evocom') ?? matches[0]
}

export function HomePage() {
  const [samples, setSamples] = useState<Product[]>([])

  useEffect(() => {
    api<{ data: Product[] }>('/products')
      .then((result) => {
        setSamples(productTypes.flatMap((type) => {
          const product = sampleFor(result.data, type)
          return product ? [product] : []
        }))
      })
      .catch(() => setSamples([]))
  }, [])

  return (
    <div>
      <PageMeta
        title="Evocom Information Technology Services | CCTV in Rodriguez, Rizal"
        description="Evocom Information Technology Services installs CCTV cameras for homes and businesses in Rodriguez, Rizal. Request a quotation for cameras, installation, or both."
      />
      <section className="relative isolate overflow-hidden bg-night text-white">
        <div className="bg-grid absolute inset-0 -z-10" />
        <div className="absolute -top-48 -left-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-copper/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 -z-10 h-[28rem] w-[36rem] max-w-full rounded-full bg-copper-dark/25 blur-3xl" />
        <div className="shell grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.02fr] lg:py-24">
          <div className="animate-rise">
            <Eyebrow tone="light">CCTV &amp; security solutions</Eyebrow>
            <h1 className="mt-5 text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl xl:text-7xl">
              See everything.
              <span className="block text-blue-400">Miss nothing.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Evocom installs professional CCTV and IP surveillance systems for homes and businesses — protecting what matters most, around the clock.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/request-quote" className={buttonClass('primary', 'px-5 py-3')}>
                Request Quote
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {assurances.map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Icon name="check" className="h-4 w-4 text-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <MonitorWall />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="shell py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Camera sample</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Cameras from the catalog</h2>
            </div>
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper hover:text-copper-dark">
              View all cameras
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {(samples.length > 0 ? samples : productTypes.map((type) => ({
              id: 0,
              name: type,
              slug: '',
              category: type,
              brand: 'Evocom',
              image_path: null,
              short_description: sampleCopy[type] ?? '',
              description: '',
              approx_price: '0',
              price_max: null,
              specifications: {},
              sort_order: 0,
              is_active: true,
            }))).map((camera) => (
              <Link
                key={camera.category}
                to={camera.slug ? `/products/${camera.slug}` : `/products?type=${encodeURIComponent(camera.category)}`}
                className="group overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 last:col-span-2 hover:-translate-y-1 hover:border-copper/40 hover:shadow-lift md:last:col-span-1"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-white">
                  <img
                    src={productPhoto(camera)}
                    alt={camera.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="block p-4">
                  <span className="block font-display font-bold text-ink">{camera.slug ? camera.name : camera.category}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">
                    {camera.slug ? `${camera.category} · ${camera.brand}` : sampleCopy[camera.category]}
                  </span>
                  {camera.slug && (
                    <span className="mt-1.5 block text-sm font-semibold text-ink">
                      {priceRange(camera.approx_price, camera.price_max)}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 pt-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-20">
        <div>
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">From first look to full coverage</h2>
          <p className="mt-3 leading-7 text-muted">
            Clear steps and no surprises. You always see the final price before you commit to anything.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <span className="font-mono text-xs font-medium text-copper">Step {String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <SurveyBanner />
    </div>
  )
}
