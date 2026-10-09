import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'

const STORAGE_KEY = 'evocom_quote_cart'

type QuoteCartValue = {
  items: CartItem[]
  count: number
  approxTotal: number
  drawerOpen: boolean
  modalOpen: boolean
  addItem: (product: Product, openDrawer?: boolean) => void
  setQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  clear: () => void
  setDrawerOpen: (open: boolean) => void
  openRequestForm: () => void
  setModalOpen: (open: boolean) => void
}

const QuoteCartContext = createContext<QuoteCartValue | null>(null)

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    document.body.style.overflow = drawerOpen || modalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen, modalOpen])

  const value = useMemo<QuoteCartValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const approxTotal = items.reduce((sum, item) => sum + item.approx_price * item.quantity, 0)

    return {
      items,
      count,
      approxTotal,
      drawerOpen,
      modalOpen,
      addItem: (product, openDrawer = true) => {
        setItems((current) => {
          const existing = current.find((item) => item.product_id === product.id)
          if (existing) {
            return current.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: Math.min(99, item.quantity + 1) }
                : item,
            )
          }
          return [
            ...current,
            {
              product_id: product.id,
              name: product.name,
              slug: product.slug,
              category: product.category,
              subtitle: product.short_description,
              approx_price: Number(product.approx_price),
              quantity: 1,
            },
          ]
        })
        if (openDrawer) {
          setDrawerOpen(true)
        }
      },
      setQuantity: (productId, quantity) => {
        setItems((current) =>
          current.map((item) =>
            item.product_id === productId ? { ...item, quantity: Math.min(99, Math.max(1, quantity)) } : item,
          ),
        )
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.product_id !== productId))
      },
      clear: () => setItems([]),
      setDrawerOpen,
      openRequestForm: () => {
        setDrawerOpen(false)
        setModalOpen(true)
      },
      setModalOpen,
    }
  }, [items, drawerOpen, modalOpen])

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>
}

export function useQuoteCart(): QuoteCartValue {
  const value = useContext(QuoteCartContext)
  if (!value) {
    throw new Error('useQuoteCart must be used inside QuoteCartProvider')
  }
  return value
}
