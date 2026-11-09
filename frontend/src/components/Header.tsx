import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { company } from '../config'
import { useQuoteCart } from '../context/QuoteCartContext'
import { Icon } from './Icon'
import { Logo } from './Logo'
import { buttonClass } from './ui'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products', end: false },
  { to: '/about', label: 'About Us', end: false },
  { to: '/contact', label: 'Contact Us', end: false },
  { to: '/track', label: 'Track request', end: false },
]

export function Header() {
  const { count, setDrawerOpen } = useQuoteCart()
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="shell flex items-center gap-3 py-3">
          <Link to="/" aria-label={`${company.wordmark} home`} className="min-w-0" onClick={() => setOpen(false)}>
            <Logo />
          </Link>
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium transition after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition ${
                    isActive ? 'text-copper after:bg-copper' : 'text-slate-600 after:bg-transparent hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <span className="ml-3 hidden lg:block">
            <Link to="/request-quote" className={buttonClass()}>
              Request a Quote
            </Link>
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open quote cart, ${count} ${count === 1 ? 'camera' : 'cameras'}`}
            className="relative ml-auto grid h-10 w-10 place-items-center rounded-lg border border-line text-ink transition hover:border-slate-300 hover:bg-paper lg:ml-0"
          >
            <Icon name="cart" />
            <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 font-mono text-[11px] font-semibold text-white ring-2 ring-white">
              {count}
            </span>
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-ink transition hover:bg-paper lg:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
        {open && (
          <nav className="animate-fade space-y-1 border-t border-line px-4 py-3 lg:hidden">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-signal text-copper' : 'text-ink hover:bg-paper'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/request-quote" onClick={() => setOpen(false)} className={buttonClass('primary', 'mt-2 w-full')}>
              Request a Quote
            </Link>
          </nav>
        )}
      </header>
    </>
  )
}
