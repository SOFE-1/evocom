import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { company, propertyTypes } from '../config'
import { useQuoteCart } from '../context/QuoteCartContext'
import { api, errorText } from '../lib/api'
import type { InspectionType } from '../types'
import { fieldClass } from './ui'

export function QuoteForm() {
  const { items, count, clear, setQuantity } = useQuoteCart()
  const [inspection, setInspection] = useState<InspectionType>('ocular')
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [site, setSite] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (items.length === 0) {
      setError('Add at least one camera before sending the request.')
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
    form.set('location', `${propertyType} · ${site}`)
    form.set('inspection_type', inspection)
    form.set('message', message)
    form.set('items', JSON.stringify(items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))))
    for (const file of files) {
      form.append('files[]', file)
    }

    setBusy(true)
    try {
      const created = await api<{ data: { reference_code: string } }>('/quotes', { method: 'POST', body: form })
      setReference(created.data.reference_code)
      clear()
      setFiles([])
    } catch (submitError) {
      setError(errorText(submitError, 'The request could not be sent.'))
    } finally {
      setBusy(false)
    }
  }

  if (reference) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-copper">REQUEST RECEIVED</p>
        <h3 className="mt-2 text-2xl font-semibold">Reference {reference}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          It is waiting in the admin queue as pending. An ocular visit, or a review of your layout, comes before the final prices.
        </p>
      </div>
    )
  }

  return (
    <form id="request" onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Request a free quote</h3>
      <p className="mt-1 text-sm text-muted">Tell us about your property. We’ll include your selected cameras in the quotation.</p>

      <div className="mt-4 rounded-xl border border-line bg-paper px-3 py-3">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-muted">
          <span>YOUR SELECTED CAMERAS ({count})</span>
          <Link to="/products" className="text-copper">Edit cart</Link>
        </div>
        {items.length === 0 && <p className="mt-2 text-sm text-muted">No cameras yet. Add them from the catalog.</p>}
        {items.map((item) => (
          <div key={item.product_id} className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted">Models and quantities will be included. We’ll check supplier pricing in PHP (₱).</p>
            </div>
            <div className="inline-flex items-center rounded-lg border border-line bg-white">
              <button type="button" className="px-2 py-1" onClick={() => setQuantity(item.product_id, item.quantity - 1)}>−</button>
              <span className="min-w-5 text-center text-sm">{item.quantity}</span>
              <button type="button" className="px-2 py-1" onClick={() => setQuantity(item.product_id, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold tracking-wide text-muted">
          FULL NAME *
          <input className={`${fieldClass} mt-1`} required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="text-xs font-semibold tracking-wide text-muted">
          PHONE *
          <input className={`${fieldClass} mt-1`} required value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold tracking-wide text-muted">
        EMAIL *
        <input className={`${fieldClass} mt-1`} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="mt-3 block text-xs font-semibold tracking-wide text-muted">
        PROPERTY TYPE *
        <select className={`${fieldClass} mt-1`} required value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
          <option value="">Select property type...</option>
          {propertyTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-xs font-semibold tracking-wide text-muted">
        SITE LOCATION *
        <input className={`${fieldClass} mt-1`} required placeholder="City or barangay" value={site} onChange={(event) => setSite(event.target.value)} />
      </label>

      <fieldset className="mt-4">
        <legend className="text-xs font-semibold tracking-wide text-muted">PREFERRED SITE INSPECTION *</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <InspectionChoice
            checked={inspection === 'ocular'}
            title="Ocular inspection"
            body="An Evocom specialist visits your property on site."
            onChange={() => setInspection('ocular')}
          />
          <InspectionChoice
            checked={inspection === 'non_ocular'}
            title="Non-ocular inspection"
            body="We assess your property remotely using your media."
            onChange={() => setInspection('non_ocular')}
          />
        </div>
      </fieldset>

      {inspection === 'non_ocular' && (
        <div className="mt-4 rounded-xl border border-dashed border-line p-4">
          <p className="text-xs font-semibold tracking-wide text-muted">SITE PHOTOS OR VIDEOS *</p>
          <p className="mt-1 text-sm text-muted">Select clear photos or short videos showing entrances, camera locations, and the areas you want covered.</p>
          <input
            className="mt-3 block text-sm"
            type="file"
            accept="image/jpeg,image/png,video/mp4"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          <p className="mt-2 text-xs text-muted">JPG, PNG, or MP4. Up to 3 files, 20 MB each.</p>
        </div>
      )}

      <label className="mt-4 block text-xs font-semibold tracking-wide text-muted">
        TELL US MORE *
        <textarea
          className={`${fieldClass} mt-1 min-h-28`}
          required
          placeholder="e.g. Camera locations, property size, recording requirements, and whether you need installation..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="mt-4 w-full rounded-lg bg-copper py-3 text-sm font-semibold text-white hover:bg-copper-dark disabled:opacity-60">
        {busy ? 'Sending…' : 'Prepare quotation request'}
      </button>
      <p className="mt-2 text-center text-xs text-muted">No payment. {company.name} confirms the quotation before you decide.</p>
    </form>
  )
}

function InspectionChoice({
  checked,
  title,
  body,
  onChange,
}: {
  checked: boolean
  title: string
  body: string
  onChange: () => void
}) {
  return (
    <label className={`cursor-pointer rounded-xl border p-3 ${checked ? 'border-copper bg-signal' : 'border-line bg-white'}`}>
      <span className="flex items-start gap-2">
        <input type="radio" className="mt-1" checked={checked} onChange={onChange} />
        <span>
          <span className="block text-sm font-semibold text-ink">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{body}</span>
        </span>
      </span>
    </label>
  )
}
