import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productFocus, productPhoto } from '../catalog'
import { useQuoteCart } from '../context/QuoteCartContext'

export function QuoteDrawer() {
  const { items, count, drawerOpen, setDrawerOpen, setQuantity, removeItem } = useQuoteCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!drawerOpen) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close quote cart" className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-copper">YOUR SECURITY, YOUR SELECTION</p>
            <h2 className="mt-1 text-xl font-semibold">Quotation cart ({count})</h2>
            <p className="mt-1 text-sm text-muted">Choose your cameras. We’ll tailor the quote.</p>
          </div>
          <button type="button" className="rounded-lg border border-line px-2 py-1 text-sm" onClick={() => setDrawerOpen(false)}>
            ×
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {items.length === 0 && <p className="text-sm text-muted">Your quote cart is empty. Add a camera from the catalog.</p>}
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-3 border-b border-line pb-4">
              <img
                src={productPhoto(item.slug)}
                alt=""
                className="h-16 w-16 rounded-lg object-cover"
                style={{ objectPosition: productFocus(item.slug) }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{item.category ? `${item.category} camera` : 'Camera'}</p>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted">{item.subtitle || 'Supplier price · Quoted in PHP (₱)'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-line">
                    <button type="button" className="px-2.5 py-1" onClick={() => setQuantity(item.product_id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                    <button type="button" className="px-2.5 py-1" onClick={() => setQuantity(item.product_id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => removeItem(item.product_id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total cameras</span>
            <span className="font-semibold">{count}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span>Equipment & installation</span>
            <span className="font-semibold text-copper">To be quoted · PHP (₱)</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            No payment required. Prices depend on current supplier rates and availability. We’ll confirm camera, recording equipment, and installation costs in Philippine pesos before you decide.
          </p>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              setDrawerOpen(false)
              navigate('/contact#request')
            }}
            className="mt-4 w-full rounded-lg bg-copper py-3 text-sm font-semibold text-white hover:bg-copper-dark disabled:opacity-50"
          >
            Request a quotation →
          </button>
          <button type="button" className="mt-2 w-full py-2 text-sm font-medium text-muted" onClick={() => setDrawerOpen(false)}>
            Continue browsing
          </button>
        </div>
      </aside>
    </div>
  )
}
