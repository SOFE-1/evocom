import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { ProductViewer } from '../components/ProductViewer'
import { PageMeta } from '../components/PageMeta'
import { Skeleton, buttonClass, cardClass } from '../components/ui'
import { hasProductImage, productBadge, productPhoto, visibleSpecs } from '../catalog'
import { terms } from '../config'
import { useQuoteCart } from '../context/QuoteCartContext'
import { api, errorText } from '../lib/api'
import { priceRange } from '../lib/format'
import type { Product } from '../types'

const assurances = [
  'No payment to request a quote',
  `${terms.warrantyYears}-year warranty after the installation is completed and paid`,
]

export function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useQuoteCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [show3d, setShow3d] = useState(false)
  const [imageMissing, setImageMissing] = useState(false)

  useEffect(() => {
    setShow3d(false)
    setImageMissing(false)
    if (!slug) {
      return
    }
    api<{ data: Product }>(`/products/${slug}`)
      .then((result) => setProduct(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'That camera could not be found.')))
  }, [slug])

  if (error) {
    return (
      <div className="shell py-20 text-center">
        <Icon name="camera" className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm text-red-700">{error}</p>
        <Link to="/products" className={buttonClass('ghost', 'mt-5')}>Back to catalog</Link>
      </div>
    )
  }
  if (!product) {
    return (
      <div className="shell grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="aspect-[4/3] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  const badge = productBadge(product)
  const canInspect = hasProductImage(product) && !imageMissing

  return (
    <div className="shell py-8 lg:py-10">
      <PageMeta
        title={`${product.name} | Evocom`}
        description={product.short_description}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
        <Link to="/products" className="inline-flex items-center gap-1.5 font-medium text-copper hover:text-copper-dark">
          <Icon name="arrow-left" className="h-4 w-4" />
          Back to catalog
        </Link>
        <Icon name="chevron-right" className="h-4 w-4 text-slate-400" />
        <span className="truncate">{product.name}</span>
      </nav>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={`viewfinder relative overflow-hidden rounded-2xl border border-line bg-white shadow-card lg:sticky lg:top-24 ${show3d ? '' : '[--vf:var(--color-copper)]'}`}>
          {canInspect && show3d ? (
            <ProductViewer product={product} />
          ) : (
            <img
              src={productPhoto(product)}
              alt={product.name}
              className="block aspect-[4/3] w-full bg-slate-100 object-cover"
              onError={() => {
                setImageMissing(true)
                setShow3d(false)
              }}
            />
          )}
          {badge && <span className="pointer-events-none absolute top-6 left-6 z-10 rounded-md bg-night/85 px-2 py-1 font-mono text-xs font-medium text-white">{badge}</span>}
          {canInspect && (
            <button
              type="button"
              aria-pressed={show3d}
              onClick={() => setShow3d((value) => !value)}
              className={`absolute right-6 bottom-6 z-10 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold shadow-md transition ${show3d ? 'bg-white text-ink hover:bg-slate-50' : 'bg-night text-white hover:bg-ink'}`}
            >
              <Icon name="cube" className="h-4 w-4" />
              {show3d ? 'Photo' : '3D'}
            </button>
          )}
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-[0.14em] text-copper uppercase">
            {product.category} <span className="text-slate-400">· {product.brand}</span>
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-slate-600">{product.short_description}</p>
          <p className="mt-4 leading-7 text-muted">{product.description}</p>
          <dl className={`mt-6 divide-y divide-line ${cardClass}`}>
            {[['Brand', product.brand] as [string, string], ...visibleSpecs(product)].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-signal p-5">
            <p className="font-display text-lg font-bold">{priceRange(product.approx_price, product.price_max)}</p>
            <p className="text-sm text-slate-600">Price range in PHP (₱). Final amount is confirmed in your quote.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => addItem(product)} className={buttonClass('primary', 'px-5 py-3')}>
                <Icon name="cart" className="h-4 w-4" />
                Add to cart
              </button>
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-slate-600">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Icon name="check" className="h-4 w-4 text-copper" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
