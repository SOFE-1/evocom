import { Link } from 'react-router-dom'
import { productBadge, productFocus, productPhoto, visibleSpecs } from '../catalog'
import { useQuoteCart } from '../context/QuoteCartContext'
import type { Product } from '../types'

export function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useQuoteCart()
  const inCart = items.find((item) => item.product_id === product.id)
  const badge = productBadge(product)
  const specs = visibleSpecs(product).slice(0, 3)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <Link to={`/products/${product.slug}`} className="relative block h-44 overflow-hidden bg-slate-200">
        <img
          src={productPhoto(product.slug)}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: productFocus(product.slug) }}
        />
        {badge && (
          <span className="absolute top-3 left-3 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-semibold text-white">
            {badge}
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-ink">
          {product.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold tracking-tight">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.short_description}</p>
        <dl className="mt-4 space-y-2 text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-3 border-b border-line/80 pb-2">
              <dt className="text-muted">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Request current price</p>
            <p className="text-xs text-muted">Supplier-dependent · Confirmed in your quote</p>
          </div>
          <p className="text-xs font-semibold tracking-wide text-muted">PHP (₱)</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="rounded-lg border border-line px-3 py-2.5 text-center text-sm font-semibold hover:border-slate-300"
          >
            View Full Specs
          </Link>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="rounded-lg bg-copper px-3 py-2.5 text-sm font-semibold text-white hover:bg-copper-dark"
          >
            {inCart ? `Add more (${inCart.quantity})` : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
