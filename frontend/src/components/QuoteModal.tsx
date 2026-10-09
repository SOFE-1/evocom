import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { terms } from '../config'
import { useQuoteCart } from '../context/QuoteCartContext'
import { api, errorText } from '../lib/api'
import { inspectionLabel, peso } from '../lib/format'
import type { InspectionType, Product } from '../types'
import { Button, fieldClass } from './ui'

type CreatedQuote = {
  data: {
    reference_code: string
    status: string
    inspection_type: InspectionType
  }
}

export function QuoteModal() {
  const { items, modalOpen, setModalOpen, setQuantity, removeItem, addItem, clear, approxTotal } = useQuoteCart()
  const [products, setProducts] = useState<Product[]>([])
  const [inspection, setInspection] = useState<InspectionType>('ocular')
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!modalOpen) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, setModalOpen])

  useEffect(() => {
    if (!modalOpen || products.length > 0) {
      return
    }
    api<{ data: Product[] }>('/products')
      .then((result) => setProducts(result.data))
      .catch(() => setProducts([]))
  }, [modalOpen, products.length])

  if (!modalOpen) {
    return null
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (items.length === 0) {
      setError('Add at least one product before sending the request.')
      return
    }
    if (inspection === 'non_ocular' && files.length === 0) {
      setError('A non-ocular request needs a JPG, PNG, or MP4 of the site.')
      return
    }

    const form = new FormData()
    form.set('customer_name', name)
    form.set('customer_email', email)
    form.set('customer_phone', phone)
    form.set('location', location)
    form.set('inspection_type', inspection)
    form.set('message', message)
    form.set(
      'items',
      JSON.stringify(items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))),
    )
    files.forEach((file) => form.append('files[]', file))

    setBusy(true)
    try {
      const result = await api<CreatedQuote>('/quotes', { method: 'POST', body: form })
      setReference(result.data.reference_code)
      clear()
      setFiles([])
    } catch (submitError) {
      setError(errorText(submitError, 'The request could not be sent.'))
    } finally {
      setBusy(false)
    }
  }

  function close() {
    setModalOpen(false)
    setReference(null)
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close request form" className="absolute inset-0 bg-night/60" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-title"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-copper uppercase">Request installation</p>
            <h2 id="quote-title" className="font-display text-4xl tracking-wide uppercase">
              Quotation form
            </h2>
          </div>
          <button type="button" onClick={close} className="text-sm font-semibold">
            Close
          </button>
        </div>

        {reference ? (
          <div className="rounded-xl border border-pine/30 bg-foam p-5">
            <p className="text-sm text-pine">Request received. Reference</p>
            <p className="mt-1 font-display text-4xl tracking-wide">{reference}</p>
            <p className="mt-3 text-sm leading-6 text-ink">
              It is waiting in the admin queue as pending. An ocular visit, or a review of your layout, comes before the
              final prices.
            </p>
            <Button className="mt-4" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <section>
              <h3 className="text-sm font-semibold">Selected products</h3>
              <div className="mt-2 space-y-2">
                {items.length === 0 && (
                  <p className="text-sm text-muted">
                    Nothing selected yet.{' '}
                    <Link to="/products" className="font-semibold text-copper" onClick={close}>
                      Open the catalog
                    </Link>
                  </p>
                )}
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted">{peso(item.approx_price)} approx.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="h-7 w-7 rounded border border-line" onClick={() => setQuantity(item.product_id, item.quantity - 1)}>
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button type="button" className="h-7 w-7 rounded border border-line" onClick={() => setQuantity(item.product_id, item.quantity + 1)}>
                        +
                      </button>
                      <button type="button" className="text-xs text-muted" onClick={() => removeItem(item.product_id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {products.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product, false)}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium"
                    >
                      Add {product.name}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-right text-sm text-muted">Approximate total {peso(approxTotal)}</p>
            </section>

            <fieldset>
              <legend className="text-sm font-semibold">Inspection type</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(['ocular', 'non_ocular'] as InspectionType[]).map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-xl border p-3 ${inspection === type ? 'border-copper bg-white' : 'border-line bg-white/60'}`}
                  >
                    <input
                      type="radio"
                      name="inspection"
                      className="mr-2"
                      checked={inspection === type}
                      onChange={() => setInspection(type)}
                    />
                    <span className="text-sm font-semibold">{inspectionLabel(type)}</span>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {type === 'ocular'
                        ? 'A technician visits the worksite. No file is required.'
                        : 'Upload a site layout or walkthrough. The file is stored with the request.'}
                    </p>
                  </label>
                ))}
              </div>
            </fieldset>

            {inspection === 'non_ocular' && (
              <label className="block text-sm font-medium">
                Site layout (JPG, PNG, or MP4, up to 3 files, 20 MB each)
                <input
                  className="mt-2 block w-full text-sm"
                  type="file"
                  accept="image/jpeg,image/png,video/mp4"
                  multiple
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 3))}
                />
                {files.length > 0 && (
                  <span className="mt-1 block text-xs text-muted">{files.map((file) => file.name).join(', ')}</span>
                )}
              </label>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Name
                <input className={`${fieldClass} mt-1.5`} required value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="text-sm font-medium">
                Phone
                <input className={`${fieldClass} mt-1.5`} required value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
              <label className="text-sm font-medium">
                Email
                <input className={`${fieldClass} mt-1.5`} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="text-sm font-medium">
                Location
                <input
                  className={`${fieldClass} mt-1.5`}
                  required
                  placeholder="Site address"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Notes for the technician
              <textarea className={`${fieldClass} mt-1.5 min-h-24`} value={message} onChange={(event) => setMessage(event.target.value)} />
            </label>
            <p className="text-xs leading-5 text-muted">
              Sending this request does not confirm a purchase. Final prices come after inspection. If you proceed, the
              down payment is {terms.downPaymentPercent}% before installation is scheduled.
            </p>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Sending…' : 'Submit request'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
