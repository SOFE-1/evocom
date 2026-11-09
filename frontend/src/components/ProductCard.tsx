import { Link } from 'react-router-dom'
import { productBadge, productPhoto, visibleSpecs } from '../catalog'
import { useQuoteCart } from '../context/QuoteCartContext'
import type { Product } from '../types'
import { Icon } from './Icon'
import { priceRange } from '../lib/format'
import { Skeleton, buttonClass } from './ui'

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useQuoteCart()
  const inCart = items.find((item) => item.product_id === product.id)
  const badge = productBadge(product)
  const specs = visibleSpecs(product).slice(0, 3)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-lift">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[16/11] overflow-hidden bg-slate-100">
        <img
          src={productPhoto(product)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-night/85 px-2 py-1 font-mono text-[11px] font-medium text-white">
            {badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-copper uppercase">
          {product.category} <span className="text-slate-400">· {product.brand}</span>
        </p>
        <h3 className="mt-2 text-xl font-bold">
          <Link to={`/products/${product.slug}`} className="transition hover:text-copper">{product.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.short_description}</p>
        <dl className="mt-4 flex-1 divide-y divide-line border-y border-line text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 py-2">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm">
          <span className="font-semibold text-ink">{priceRange(product.approx_price, product.price_max)}</span>
          <span className="mt-0.5 block text-xs text-muted">Price range · confirmed in your quote</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/products/${product.slug}`} className={buttonClass('ghost', 'px-3')}>
            View Full Specs
          </Link>
          <button type="button" onClick={() => addItem(product)} className={buttonClass('primary', 'px-3')}>
            {inCart ? <Icon name="check" className="h-4 w-4" /> : null}
            {inCart ? `Add more (${inCart.quantity})` : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <Skeleton className="aspect-[16/11] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
