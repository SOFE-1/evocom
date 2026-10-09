import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { productFilters } from '../config'
import { api, errorText } from '../lib/api'
import type { Product } from '../types'

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('type') ?? 'All'
  const filter = productFilters.includes(requested as (typeof productFilters)[number]) ? requested : 'All'
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<{ data: Product[] }>('/products')
      .then((result) => setProducts(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The catalog could not be loaded.')))
  }, [])

  const visible = useMemo(
    () => (filter === 'All' ? products : products.filter((product) => product.category === filter)),
    [products, filter],
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-copper">PRODUCT CATALOGUE</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Our CCTV camera range</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Explore the specifications, add your preferred cameras to your cart, then request a personalised quotation. No payment required.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {productFilters.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setParams(type === 'All' ? {} : { type })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === type ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-signal px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6">
          <span className="font-semibold">Supplier-based pricing. A quote tailored to your system.</span>
          <span className="mt-1 block text-muted">
            CCTV prices vary by supplier and availability, so we don’t list fixed prices or estimated totals. Select your cameras and we’ll confirm the latest equipment and installation costs in a no-obligation quotation.
          </span>
        </p>
        <p className="shrink-0 text-xs font-semibold text-muted">All quotes in PHP (₱)</p>
      </div>

      <p className="mt-6 text-xs font-semibold tracking-wide text-muted">
        <span className="text-ink">01 Select cameras</span>
        <span className="mx-2">/</span>
        02 Review your cart
        <span className="mx-2">/</span>
        03 Request a quote
      </p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!error && visible.length === 0 && <p className="mt-8 text-sm text-muted">No cameras in this category yet.</p>}
    </div>
  )
}
