import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productPhoto } from '../catalog'
import { useQuoteCart } from '../context/QuoteCartContext'
import { Icon } from './Icon'
import { Eyebrow, QtyStepper, buttonClass } from './ui'

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
      <button
        type="button"
        aria-label="Close quote cart"
        className="absolute inset-0 animate-fade bg-night/50 backdrop-blur-sm"
        onClick={() => setDrawerOpen(false)}
      />
      <aside role="dialog" aria-modal="true" aria-label="Quotation cart" className="absolute top-0 right-0 flex h-full w-full max-w-md animate-drawer flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <Eyebrow className="text-[11px]">Your security, your selection</Eyebrow>
            <h2 className="mt-1 text-2xl font-extrabold">Quotation cart ({count})</h2>
            <p className="mt-1 text-sm text-muted">Choose your cameras. We’ll tailor the quote.</p>
          </div>
          <button
            type="button"
            aria-label="Close quote cart"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:bg-paper hover:text-ink"
            onClick={() => setDrawerOpen(false)}
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-5 py-4">
          {items.length === 0 && (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-tide text-copper">
                  <Icon name="cart" className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-lg font-bold">Your quote cart is empty</p>
                <p className="mt-1 text-sm text-muted">Add a camera from the catalog.</p>
                <Link to="/products" onClick={() => setDrawerOpen(false)} className={buttonClass('ghost', 'mt-4')}>
                  Browse cameras
                </Link>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.product_id} className="flex gap-3 rounded-xl border border-line bg-white p-3">
              <img src={productPhoto(item)} alt="" className="h-20 w-20 rounded-lg bg-slate-100 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">{item.category || 'Camera'}</p>
                <p className="font-semibold">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.subtitle || 'Supplier price · Quoted in PHP (₱)'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <QtyStepper quantity={item.quantity} label={item.name} onChange={(next) => setQuantity(item.product_id, next)} />
                  <button type="button" className="text-sm text-muted transition hover:text-red-700" onClick={() => removeItem(item.product_id)}>
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
            <span className="font-mono font-semibold">{count}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>Equipment &amp; installation</span>
            <span className="font-semibold text-copper">To be quoted · PHP (₱)</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            No payment required. Prices depend on current supplier rates and availability. We’ll confirm camera, recording equipment, and installation costs in Philippine pesos before you decide.
          </p>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false)
              navigate('/request-quote')
            }}
            className={buttonClass('primary', 'mt-4 w-full py-3')}
          >
            Request a Quote
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
          <button type="button" className="mt-1 w-full py-2 text-sm font-medium text-muted transition hover:text-ink" onClick={() => setDrawerOpen(false)}>
            Continue browsing
          </button>
        </div>
      </aside>
    </div>
  )
}
