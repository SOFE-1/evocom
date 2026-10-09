import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBadge, productFocus, productPhoto, visibleSpecs } from '../catalog'
import { useQuoteCart } from '../context/QuoteCartContext'
import { api, errorText } from '../lib/api'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useQuoteCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      return
    }
    api<{ data: Product }>(`/products/${slug}`)
      .then((result) => setProduct(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'That camera could not be found.')))
  }, [slug])

  if (error) {
    return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-red-700">{error}</p>
  }
  if (!product) {
    return <p className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted">Loading product…</p>
  }

  const badge = productBadge(product)

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative overflow-hidden rounded-2xl bg-slate-200">
        <img
          src={productPhoto(product.slug)}
          alt=""
          className="aspect-[4/3] w-full object-cover"
          style={{ objectPosition: productFocus(product.slug) }}
        />
        {badge && <span className="absolute top-4 left-4 rounded-md bg-ink/80 px-2 py-1 text-xs font-semibold text-white">{badge}</span>}
      </div>
      <div>
        <Link to="/products" className="text-sm font-medium text-copper">Back to catalog</Link>
        <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-muted">{product.category}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-3 text-muted">{product.short_description}</p>
        <p className="mt-4 text-sm leading-7">{product.description}</p>
        <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {visibleSpecs(product).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm font-semibold">Request current price <span className="font-normal text-muted">· PHP (₱), confirmed in your quote</span></p>
        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-5 rounded-lg bg-copper px-5 py-3 text-sm font-semibold text-white hover:bg-copper-dark"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
