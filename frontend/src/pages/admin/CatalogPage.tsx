import { useEffect, useRef, useState, type FormEvent } from 'react'
import { productPhoto } from '../../catalog'
import { Icon } from '../../components/Icon'
import { Button, Eyebrow, Skeleton, SectionLabel, cardClass, fieldClass, labelClass } from '../../components/ui'
import { productTypes } from '../../config'
import { api, errorText } from '../../lib/api'
import { priceRange } from '../../lib/format'
import type { Product } from '../../types'

type SpecRow = { key: string; value: string }

type Draft = {
  id: number | null
  name: string
  category: string
  brand: string
  image_path: string
  short_description: string
  description: string
  approx_price: string
  price_max: string
  sort_order: string
  is_active: boolean
  specs: SpecRow[]
}

const blank: Draft = {
  id: null,
  name: '',
  category: 'Bullet Camera',
  brand: 'Evocom',
  image_path: '',
  short_description: '',
  description: '',
  approx_price: '',
  price_max: '',
  sort_order: '0',
  is_active: true,
  specs: [{ key: '', value: '' }],
}

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [draft, setDraft] = useState<Draft>(blank)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const formScrollRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const [formActive, setFormActive] = useState(false)

  function load() {
    api<{ data: Product[] }>('/admin/products')
      .then((result) => setProducts(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The catalog could not be loaded.')))
      .finally(() => setLoaded(true))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!formActive) {
      return
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setFormActive(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formActive])

  function focusForm() {
    setFormActive(true)
    window.requestAnimationFrame(() => {
      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0
      }
      nameRef.current?.focus({ preventScroll: true })
    })
  }

  function edit(product: Product) {
    setDraft({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand ?? 'Evocom',
      image_path: product.image_path ?? '',
      short_description: product.short_description,
      description: product.description,
      approx_price: product.approx_price,
      price_max: product.price_max ?? '',
      sort_order: String(product.sort_order),
      is_active: product.is_active,
      specs:
        Object.keys(product.specifications).length > 0
          ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }],
    })
    setImageFile(null)
    setPreview(product.image_path ? productPhoto(product) : null)
    focusForm()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const body = new FormData()
    if (draft.id) {
      body.append('_method', 'PUT')
    }
    body.append('name', draft.name)
    body.append('category', draft.category)
    body.append('brand', draft.brand)
    body.append('short_description', draft.short_description)
    body.append('description', draft.description)
    body.append('approx_price', draft.approx_price)
    body.append('price_max', draft.price_max)
    body.append('sort_order', draft.sort_order || '0')
    body.append('is_active', draft.is_active ? '1' : '0')
    for (const row of draft.specs) {
      if (row.key.trim() !== '') {
        body.append(`specifications[${row.key.trim()}]`, row.value.trim())
      }
    }
    if (imageFile) {
      body.append('image', imageFile)
    }
    try {
      await api(draft.id ? `/admin/products/${draft.id}` : '/admin/products', { method: 'POST', body })
      setDraft(blank)
      setImageFile(null)
      setPreview(null)
      load()
    } catch (saveError) {
      setError(errorText(saveError, 'The product could not be saved.'))
    } finally {
      setBusy(false)
    }
  }

  const published = products.filter((product) => product.is_active).length

  return (
    <div className="flex flex-col px-4 py-6 lg:px-8 lg:py-8 xl:h-[calc(100dvh-4.25rem)] xl:overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Catalog</Eyebrow>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Product catalog manager</h1>
          <p className="mt-1 text-sm text-muted">Manage the cameras shown in the client catalog.</p>
        </div>
        <Button
          onClick={() => {
            setDraft(blank)
            focusForm()
          }}
        >
          <Icon name="plus" className="h-4 w-4" />
          Add product
        </Button>
      </div>
      <dl className="mt-6 grid shrink-0 grid-cols-3 gap-3">
        <Stat label="Total models" value={String(products.length).padStart(2, '0')} />
        <Stat label="Published" value={String(published).padStart(2, '0')} />
        <Stat label="Draft" value={String(products.length - published).padStart(2, '0')} />
      </dl>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {formActive && (
        <button
          type="button"
          aria-label="Leave the product form"
          className="fixed inset-0 z-30 bg-night/40 xl:hidden"
          onClick={() => setFormActive(false)}
        />
      )}
      <div className="mt-4 grid items-stretch gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div
          className={`panel-scroll relative overflow-auto overscroll-contain max-xl:max-h-[45vh] xl:min-h-0 ${cardClass} ${formActive ? 'xl:opacity-50' : ''}`}
          onMouseDown={() => setFormActive(false)}
        >
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-line bg-white font-mono text-[11px] tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-3 font-medium sm:px-4">Product</th>
                <th className="px-3 py-3 text-right font-medium sm:px-4">Price range</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">State</th>
                <th className="px-3 py-3 sm:px-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {!loaded && (
                <tr>
                  <td colSpan={4} className="space-y-3 px-4 py-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className={`border-b border-line transition last:border-0 ${draft.id === product.id ? 'bg-signal' : 'hover:bg-paper'}`}>
                  <td className="px-3 py-3 sm:px-4">
                    <span className="flex items-center gap-3">
                      <img src={productPhoto(product)} alt="" className="hidden h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover sm:block" />
                      <span className="min-w-0">
                        <span className="block font-semibold">{product.name}</span>
                        <span className="block text-xs text-muted">{product.category} · {product.brand}</span>
                        <span className="mt-1 block sm:hidden">
                          <VisibilityBadge active={product.is_active} />
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums sm:px-4">{priceRange(product.approx_price, product.price_max)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <VisibilityBadge active={product.is_active} />
                  </td>
                  <td className="px-3 py-3 text-right sm:px-4">
                    <button type="button" className="text-sm font-semibold text-copper hover:text-copper-dark" onClick={() => edit(product)}>
                      Edit<span className="sr-only"> {product.name}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => setFormActive(true)}
          onFocus={() => setFormActive(true)}
          className={`flex min-h-0 flex-col overflow-hidden xl:h-full ${cardClass} ${
            formActive
              ? 'max-xl:fixed max-xl:inset-x-4 max-xl:top-16 max-xl:bottom-4 max-xl:z-40 max-xl:h-auto max-xl:shadow-lift xl:ring-2 xl:ring-copper/35'
              : 'max-xl:h-[min(36rem,70vh)]'
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-lg font-bold">{draft.id ? 'Edit product' : 'New product'}</h2>
            {formActive && (
              <button
                type="button"
                aria-label="Close product form"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink xl:hidden"
                onClick={(event) => {
                  event.stopPropagation()
                  setFormActive(false)
                }}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            )}
          </div>
          <div ref={formScrollRef} data-form-scroll className="panel-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
          <label className={labelClass}>
            Name
            <input ref={nameRef} className={`${fieldClass} mt-1`} required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Product type
              <select className={`${fieldClass} mt-1`} required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                {categoryOptions(draft.category).map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Brand
              <input className={`${fieldClass} mt-1`} required value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} />
            </label>
          </div>
          <label className={labelClass}>
            Product image
            <input
              className={`${fieldClass} mt-1`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                if (file && file.size > 4 * 1024 * 1024) {
                  setError('Use a JPG, PNG, or WebP image under 4 MB.')
                  event.target.value = ''
                  return
                }
                setImageFile(file)
                setPreview(file ? URL.createObjectURL(file) : draft.image_path ? productPhoto({ slug: '', image_path: draft.image_path }) : null)
              }}
            />
          </label>
          {preview && <img src={preview} alt="" className="h-36 w-full rounded-lg object-cover" />}
          <p className="text-xs text-muted">JPG, PNG, or WebP. Maximum 4 MB. Leave this empty to keep the current image.</p>
          <label className={labelClass}>
            Short description
            <input className={`${fieldClass} mt-1`} required value={draft.short_description} onChange={(event) => setDraft({ ...draft, short_description: event.target.value })} />
          </label>
          <label className={labelClass}>
            Description
            <textarea className={`${fieldClass} mt-1 min-h-24`} required value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Price from (₱)
              <input
                className={`${fieldClass} mt-1`}
                required
                inputMode="decimal"
                placeholder="3500"
                value={draft.approx_price}
                onChange={(event) => setDraft({ ...draft, approx_price: event.target.value })}
              />
            </label>
            <label className={labelClass}>
              Price to (₱)
              <input
                className={`${fieldClass} mt-1`}
                required
                inputMode="decimal"
                placeholder="12000"
                value={draft.price_max}
                onChange={(event) => setDraft({ ...draft, price_max: event.target.value })}
              />
            </label>
          </div>
          <p className="text-xs text-muted">Placeholder range for now. You can change these any time. Final prices are still confirmed in the quotation.</p>
          <label className={labelClass}>
            Sort order
            <input className={`${fieldClass} mt-1`} inputMode="numeric" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: event.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-copper" checked={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} />
            Visible on the public catalog
          </label>
          <div className="space-y-2 border-t border-line pt-3">
            <SectionLabel>Specifications</SectionLabel>
            {draft.specs.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  className={fieldClass}
                  placeholder="Label"
                  aria-label={`Specification ${index + 1} label`}
                  value={row.key}
                  onChange={(event) => {
                    const specs = draft.specs.slice()
                    specs[index] = { ...row, key: event.target.value }
                    setDraft({ ...draft, specs })
                  }}
                />
                <input
                  className={fieldClass}
                  placeholder="Value"
                  aria-label={`Specification ${index + 1} value`}
                  value={row.value}
                  onChange={(event) => {
                    const specs = draft.specs.slice()
                    specs[index] = { ...row, value: event.target.value }
                    setDraft({ ...draft, specs })
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper hover:text-copper-dark"
              onClick={() => setDraft({ ...draft, specs: [...draft.specs, { key: '', value: '' }] })}
            >
              <Icon name="plus" className="h-4 w-4" />
              Add specification
            </button>
          </div>
          </div>
          <div className="flex gap-2 border-t border-line px-4 py-3">
            <Button type="submit" disabled={busy} className="flex-1">
              {busy ? 'Saving…' : 'Save product'}
            </Button>
            {draft.id && (
              <Button type="button" variant="ghost" onClick={() => { setDraft(blank); setImageFile(null); setPreview(null) }}>
                Cancel edit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function categoryOptions(current: string): string[] {
  const types: string[] = [...productTypes]
  if (current !== '' && !types.includes(current)) {
    return [current, ...types]
  }
  return types
}

function VisibilityBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-foam text-pine' : 'bg-line text-muted'}`}>
      {active ? 'On catalog' : 'Hidden'}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`min-w-0 px-3 py-3.5 sm:px-4 ${cardClass}`}>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</dd>
    </div>
  )
}
