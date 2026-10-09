import { Link } from 'react-router-dom'
import { company } from '../config'
import { Logo } from './Logo'

const products = [
  ['Dome Cameras', 'Dome'],
  ['Bullet Cameras', 'Bullet'],
  ['PTZ Cameras', 'PTZ'],
  ['Turret Cameras', 'Turret'],
  ['Multi-Sensor', 'Multi-Sensor'],
] as const

export function Footer() {
  return (
    <footer className="bg-night text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
            Professional CCTV installation for homes and businesses. Licensed, insured, and trusted since {company.since}.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white">PRODUCTS</p>
          <ul className="mt-4 space-y-2 text-sm">
            {products.map(([label, type]) => (
              <li key={type}>
                <Link to={`/products?type=${encodeURIComponent(type)}`} className="hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white">COMPANY</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/products" className="hover:text-white">Products</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white">CONNECT</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a>
            </li>
            <li>
              <a href={company.phoneHref} className="hover:text-white">{company.phoneDisplay}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
