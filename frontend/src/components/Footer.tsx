import { Link } from 'react-router-dom'
import { company } from '../config'
import { Icon } from './Icon'
import { Logo } from './Logo'

const products = [
  ['Bullet Cameras', 'Bullet Camera'],
  ['PTZ Cameras', 'PTZ Camera'],
  ['Dome Cameras', 'Dome Camera'],
  ['Turret Cameras', 'Turret Camera'],
  ['Multi-Sensor', 'Multi-Sensor Camera'],
] as const

const headingClass = 'font-mono text-[11px] font-medium tracking-[0.16em] text-slate-400 uppercase'
const linkClass = 'transition hover:text-white'

export function Footer() {
  return (
    <footer className="bg-night text-slate-300">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
            CCTV installation for homes and businesses in {company.city}.
          </p>
        </div>
        <div>
          <p className={headingClass}>Products</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {products.map(([label, type]) => (
              <li key={type}>
                <Link to={`/products?type=${encodeURIComponent(type)}`} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={headingClass}>Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/about" className={linkClass}>About Us</Link></li>
            <li><Link to="/about#services" className={linkClass}>Services</Link></li>
            <li><Link to="/products" className={linkClass}>Products</Link></li>
            <li><Link to="/request-quote" className={linkClass}>Request a Quote</Link></li>
            <li><Link to="/contact" className={linkClass}>Contact Us</Link></li>
            <li><Link to="/track" className={linkClass}>Track a request</Link></li>
          </ul>
        </div>
        <div>
          <p className={headingClass}>Connect</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={company.phoneHref} className={`inline-flex items-center gap-2.5 ${linkClass}`}>
                <Icon name="phone" className="h-4 w-4 text-blue-300" />
                {company.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className={`inline-flex items-center gap-2.5 break-all ${linkClass}`}>
                <Icon name="mail" className="h-4 w-4 text-blue-300" />
                {company.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Icon name="pin" className="mt-0.5 h-4 w-4 text-blue-300" />
              <span>
                {company.addressLines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
          <Link to="/admin/login" className={linkClass}>Admin</Link>
        </div>
      </div>
    </footer>
  )
}
