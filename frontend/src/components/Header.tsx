import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useQuoteCart } from '../context/QuoteCartContext'
import { Logo } from './Logo'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services', end: false },
  { to: '/products', label: 'Products', end: false },
  { to: '/about', label: 'About Us', end: false },
  { to: '/contact', label: 'Contact Us', end: false },
]

export function Header() {
  const { count, setDrawerOpen } = useQuoteCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 lg:px-6">
        <Link to="/" aria-label="Evocom home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>
        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-copper' : 'text-slate-600 hover:text-ink'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/contact#request"
          className="ml-auto hidden rounded-lg bg-copper px-4 py-2 text-sm font-semibold text-white hover:bg-copper-dark lg:ml-2 lg:inline-flex"
        >
          Get a Free Quote
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink hover:border-slate-300"
        >
          <CartIcon />
          <span className="hidden sm:inline">Quote cart</span>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[11px] font-bold text-white">
            {count}
          </span>
        </button>
        <button
          type="button"
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-line px-4 py-3 lg:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-ink"
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/contact#request"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-copper px-3 py-2 text-center text-sm font-semibold text-white"
          >
            Get a Free Quote
          </Link>
        </nav>
      )}
    </header>
  )
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
