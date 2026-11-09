import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { PageHero } from '../components/PageHero'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'
import { PageMeta } from '../components/PageMeta'
import { productFilters, supplierFilters } from '../config'
import { api, errorText } from '../lib/api'
import type { Product } from '../types'

const steps = ['Select cameras', 'Review your cart', 'Request a quote']

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const aliases: Record<string, string> = {
    Dome: 'Dome Camera',
    Bullet: 'Bullet Camera',
    PTZ: 'PTZ Camera',
    Turret: 'Turret Camera',
    'Multi-Sensor': 'Multi-Sensor Camera',
  }
  const requested = aliases[params.get('type') ?? ''] ?? params.get('type') ?? 'All'
  const filter = productFilters.includes(requested as (typeof productFilters)[number]) ? requested : 'All'
  const requestedBrand = params.get('brand') ?? 'All'
  const supplier = supplierFilters.includes(requestedBrand as (typeof supplierFilters)[number]) ? requestedBrand : 'All'
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<{ data: Product[] }>('/products')
      .then((result) => setProducts(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The catalog could not be loaded.')))
      .finally(() => setLoaded(true))
  }, [])

  const visible = useMemo(
    () =>
      products.filter((product) => {
        const typeMatch = filter === 'All' || product.category === filter
        const brandMatch = supplier === 'All' || product.brand === supplier
        return typeMatch && brandMatch
      }),
    [products, filter, supplier],
  )

  function applyFilters(nextType: string, nextBrand: string) {
    const next: Record<string, string> = {}
    if (nextType !== 'All') {
      next.type = nextType
    }
    if (nextBrand !== 'All') {
      next.brand = nextBrand
    }
    setParams(next)
  }

  return (
    <div>
      <PageMeta
        title="CCTV cameras | Evocom"
        description="Browse Hikvision, Dahua, Imou, and Evocom cameras, then request a quotation from Evocom Information Technology Services."
      />
      <PageHero eyebrow="Product catalogue" title="Cameras by supplier">
        Filter by Hikvision, Dahua, Imou, or Evocom, then by camera type. Catalog prices are a range for now and are confirmed in the quotation.
      </PageHero>

      <div className="sticky top-[65px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="shell space-y-2 py-3">
          <div className="flex gap-2 overflow-x-auto" aria-label="CCTV suppliers">
            {supplierFilters.map((brand) => (
              <button
                key={brand}
                type="button"
                aria-pressed={supplier === brand}
                onClick={() => applyFilters(filter, brand)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  supplier === brand ? 'bg-night text-white' : 'bg-paper text-ink hover:bg-tide'
                }`}
              >
                {brand === 'All' ? 'All suppliers' : brand}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto" aria-label="Camera types">
            {productFilters.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={filter === type}
                onClick={() => applyFilters(type, supplier)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === type ? 'bg-copper text-white shadow-sm shadow-copper/25' : 'bg-paper text-ink hover:bg-tide'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shell py-8 lg:py-10">
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-signal px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-copper shadow-sm">
            <Icon name="receipt" />
          </span>
          <p className="text-sm leading-6">
            <span className="font-semibold">Price range for now. A quote tailored to your system.</span>
            <span className="block text-slate-600">
              Each camera shows a PHP (₱) range as a placeholder. We confirm the latest equipment and installation costs in a no-obligation quotation.
            </span>
          </p>
          <p className="shrink-0 font-mono text-xs font-medium text-slate-600 sm:ml-auto">All quotes in PHP (₱)</p>
        </div>

        <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] font-semibold ${index === 0 ? 'bg-copper text-white' : 'bg-tide text-tide-ink'}`}>
                {index + 1}
              </span>
              <span className={index === 0 ? 'font-semibold text-ink' : 'text-slate-600'}>{step}</span>
              {index < steps.length - 1 && <Icon name="chevron-right" className="h-4 w-4 text-slate-400" />}
            </li>
          ))}
        </ol>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!loaded && Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {loaded && !error && visible.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <Icon name="camera" className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm text-muted">No cameras match this supplier and camera type.</p>
          </div>
        )}
      </div>
    </div>
  )
}
