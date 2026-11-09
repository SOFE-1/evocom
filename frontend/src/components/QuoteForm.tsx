import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { productPhoto } from '../catalog'
import { company, propertyTypes } from '../config'
import { useQuoteCart } from '../context/QuoteCartContext'
import { api, errorText } from '../lib/api'
import type { InspectionType } from '../types'
import { BotGuardFields } from './BotGuardFields'
import { Icon } from './Icon'
import { Eyebrow, QtyStepper, buttonClass, cardClass, fieldClass, labelClass } from './ui'

export function QuoteForm() {
  const { items, count, clear, setQuantity } = useQuoteCart()
  const [inspection, setInspection] = useState<InspectionType>('ocular')
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyChoice, setPropertyChoice] = useState('')
  const [propertyOther, setPropertyOther] = useState('')
  const [site, setSite] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [formLoadedAt] = useState(() => Math.floor(Date.now() / 1000))

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (inspection === 'non_ocular' && files.length === 0) {
      setError('A non-ocular request needs a JPG, PNG, or MP4 of the site.')
      return
    }
    const propertyType = propertyChoice === 'Other' ? propertyOther.trim() : propertyChoice
    if (propertyType === '') {
      setError('Type the property type.')
      return
    }

    const native = new FormData(event.currentTarget)
    const form = new FormData()
    form.set('customer_name', name)
    form.set('customer_email', email)
    form.set('customer_phone', phone)
    form.set('location', `${propertyType.split('·').join('-')} · ${site}`)
    form.set('inspection_type', inspection)
    form.set('message', message)
    form.set('items', JSON.stringify(items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))))
    form.set('company_website', String(native.get('company_website') ?? ''))
    form.set('form_loaded_at', String(formLoadedAt))
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
      <div className={`animate-rise p-6 sm:p-8 ${cardClass}`}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-foam text-pine">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <Eyebrow className="mt-5">Request received</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold">Thank you, we have your request</h2>
        <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-muted">
          Reference <span className="ml-1 font-mono text-base font-semibold text-ink">{reference}</span>
        </p>
        <p className="mt-4 text-sm leading-6 text-muted">
          A confirmation with this reference is sent to {email}. You can check the status any time with the reference and that email address.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/track" className={buttonClass('primary')}>Track this request</Link>
          <Link to="/products" className={buttonClass('ghost')}>Back to catalog</Link>
        </div>
      </div>
    )
  }

  return (
    <form id="request" onSubmit={onSubmit} className={`relative scroll-mt-24 divide-y divide-line ${cardClass}`}>
      <FormSection step={1} title="Your cameras" action={<Link to="/products" className="text-sm font-semibold text-copper hover:text-copper-dark">Edit cart</Link>}>
        <p className="text-sm text-muted">
          Selected cameras are included when you have them. You can also inquire about installation on its own.
        </p>
        <div className="mt-3 rounded-xl border border-line bg-paper p-3">
          <p className="font-mono text-[11px] font-medium tracking-wide text-muted uppercase">Your selected cameras ({count})</p>
          {items.length === 0 && (
            <p className="mt-2 text-sm text-muted">
              No cameras selected. You can still send this form for an installation inquiry, or add cameras from the catalog.
            </p>
          )}
          {items.map((item) => (
            <div key={item.product_id} className="mt-3 flex items-center gap-3">
              <img src={productPhoto(item)} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted">We’ll check supplier pricing in PHP (₱).</p>
              </div>
              <QtyStepper quantity={item.quantity} label={item.name} onChange={(next) => setQuantity(item.product_id, next)} />
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection step={2} title="Your details">
        <BotGuardFields formLoadedAt={formLoadedAt} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Full name <Required />
            <input className={`${fieldClass} mt-1.5`} required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className={labelClass}>
            Phone <Required />
            <input className={`${fieldClass} mt-1.5`} required type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Email <Required />
            <input className={`${fieldClass} mt-1.5`} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className={labelClass}>
            Property type <Required />
            <select className={`${fieldClass} mt-1.5`} required value={propertyChoice} onChange={(event) => setPropertyChoice(event.target.value)}>
              <option value="">Select property type...</option>
              {propertyTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
              <option>Other</option>
            </select>
          </label>
          {propertyChoice === 'Other' && (
            <label className={`${labelClass} sm:col-span-2`}>
              Other property type <Required />
              <input
                className={`${fieldClass} mt-1.5`}
                required
                maxLength={80}
                placeholder="Type the property type"
                value={propertyOther}
                onChange={(event) => setPropertyOther(event.target.value)}
              />
            </label>
          )}
          <label className={labelClass}>
            Site location <Required />
            <input className={`${fieldClass} mt-1.5`} required placeholder="City or barangay" value={site} onChange={(event) => setSite(event.target.value)} />
          </label>
        </div>
      </FormSection>

      <FormSection step={3} title="Site inspection">
        <fieldset>
          <legend className="sr-only">Preferred site inspection</legend>
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="mt-4 animate-fade rounded-xl border-2 border-dashed border-slate-300 bg-paper p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="upload" className="h-4 w-4 text-copper" />
              Site photos or videos <Required />
            </p>
            <p className="mt-1 text-sm text-muted">Select clear photos or short videos showing entrances, camera locations, and the areas you want covered.</p>
            <input
              className="mt-3 block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-tide file:px-3 file:py-2 file:text-sm file:font-semibold file:text-tide-ink hover:file:bg-blue-200"
              type="file"
              accept="image/jpeg,image/png,video/mp4"
              multiple
              aria-label="Site photos or videos"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <p className="mt-2 text-xs text-muted">JPG, PNG, or MP4. Up to 3 files, 20 MB each.</p>
          </div>
        )}
      </FormSection>

      <FormSection step={4} title="Tell us more" hint="Optional">
        <textarea
          className={`${fieldClass} min-h-28`}
          aria-label="Tell us more"
          placeholder="e.g. Camera locations, property size, recording requirements, and whether you need installation..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={buttonClass('primary', 'mt-4 w-full py-3')}>
          {busy ? 'Sending…' : 'Prepare quotation request'}
        </button>
        <p className="mt-2 text-center text-xs text-muted">No payment. {company.name} confirms the quotation before you decide.</p>
      </FormSection>
    </form>
  )
}

function Required() {
  return <span className="text-copper" aria-hidden="true">*</span>
}

function FormSection({
  step,
  title,
  hint,
  action,
  children,
}: {
  step: number
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-copper font-mono text-xs font-semibold text-white">{step}</span>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <span className="text-sm text-muted">{hint}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </section>
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
    <label className={`cursor-pointer rounded-xl border p-4 transition ${checked ? 'border-copper bg-signal ring-1 ring-copper' : 'border-line bg-white hover:border-slate-300'}`}>
      <span className="flex items-start gap-2.5">
        <input type="radio" name="inspection" className="mt-1 accent-copper" checked={checked} onChange={onChange} />
        <span>
          <span className="block text-sm font-semibold text-ink">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{body}</span>
        </span>
      </span>
    </label>
  )
}
