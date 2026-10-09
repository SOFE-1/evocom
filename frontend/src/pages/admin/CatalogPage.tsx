import { useEffect, useState, type FormEvent } from 'react'
import { Button, fieldClass } from '../../components/ui'
import { api, errorText } from '../../lib/api'
import { peso } from '../../lib/format'
import type { Product } from '../../types'

type SpecRow = { key: string; value: string }

type Draft = {
  id: number | null
  name: string
  category: string
  short_description: string
  description: string
  approx_price: string
  sort_order: string
  is_active: boolean
  specs: SpecRow[]
}

const blank: Draft = {
  id: null,
  name: '',
  category: 'Camera',
  short_description: '',
  description: '',
  approx_price: '',
  sort_order: '0',
  is_active: true,
  specs: [{ key: '', value: '' }],
}

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [draft, setDraft] = useState<Draft>(blank)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function load() {
    api<{ data: Product[] }>('/admin/products')
      .then((result) => setProducts(result.data))
      .catch((loadError: unknown) => setError(errorText(loadError, 'The catalog could not be loaded.')))
  }

  useEffect(() => {
    load()
  }, [])

  function edit(product: Product) {
    setDraft({
      id: product.id,
      name: product.name,
      category: product.category,
      short_description: product.short_description,
      description: product.description,
      approx_price: product.approx_price,
      sort_order: String(product.sort_order),
      is_active: product.is_active,
      specs:
        Object.keys(product.specifications).length > 0
          ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }],
    })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const specifications = Object.fromEntries(
      draft.specs.filter((row) => row.key.trim() !== '').map((row) => [row.key.trim(), row.value.trim()]),
    )
    const payload = {
      name: draft.name,
      category: draft.category,
      short_description: draft.short_description,
      description: draft.description,
      approx_price: draft.approx_price,
      sort_order: Number(draft.sort_order || 0),
      is_active: draft.is_active,
      specifications,
    }
    try {
      if (draft.id) {
        await api(`/admin/products/${draft.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) })
      }
      setDraft(blank)
      load()
    } catch (saveError) {
      setError(errorText(saveError, 'The product could not be saved.'))
    } finally {
      setBusy(false)
    }
  }

  const published = products.filter((product) => product.is_active).length

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product catalog manager</h1>
          <p className="mt-1 text-sm text-muted">Frontend mockup for managing cameras shown in the client catalog.</p>
        </div>
        <button type="button" className="rounded-lg bg-copper px-4 py-2 text-sm font-semibold text-white" onClick={() => setDraft(blank)}>
          + Add product
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Total models" value={String(products.length).padStart(2, '0')} />
        <Stat label="Published" value={String(published).padStart(2, '0')} />
        <Stat label="Draft" value={String(products.length - published).padStart(2, '0')} />
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-white p-4">
          <h2 className="text-sm font-semibold">{draft.id ? 'Edit product' : 'New product'}</h2>
          <input className={fieldClass} required placeholder="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <input className={fieldClass} required placeholder="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
          <input className={fieldClass} required placeholder="Short description" value={draft.short_description} onChange={(event) => setDraft({ ...draft, short_description: event.target.value })} />
          <textarea className={`${fieldClass} min-h-24`} required placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={fieldClass} required inputMode="decimal" placeholder="Approx. price" value={draft.approx_price} onChange={(event) => setDraft({ ...draft, approx_price: event.target.value })} />
            <input className={fieldClass} inputMode="numeric" placeholder="Sort order" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: event.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.is_active} onChange={(event) => setDraft({ ...draft, is_active: event.target.checked })} />
            Visible on the public catalog
          </label>
          <div className="space-y-2">
            <p className="text-xs tracking-wide text-muted uppercase">Specifications</p>
            {draft.specs.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <input
                  className={fieldClass}
                  placeholder="Label"
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
              className="text-xs font-semibold"
              onClick={() => setDraft({ ...draft, specs: [...draft.specs, { key: '', value: '' }] })}
            >
              Add specification
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save product'}
            </Button>
            {draft.id && (
              <Button type="button" variant="ghost" onClick={() => setDraft(blank)}>
                Cancel edit
              </Button>
            )}
          </div>
        </form>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Approx.</th>
                <th className="px-3 py-3">State</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-3">
                    <button type="button" className="text-left font-medium" onClick={() => edit(product)}>
                      {product.name}
                    </button>
                    <span className="block text-xs text-muted">{product.category}</span>
                  </td>
                  <td className="px-3 py-3">{peso(product.approx_price)}</td>
                  <td className="px-3 py-3">{product.is_active ? 'On catalog' : 'Hidden'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-4">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted">{label.toUpperCase()}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}
