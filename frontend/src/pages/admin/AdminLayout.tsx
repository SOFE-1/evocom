import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: 'Design requests', end: true },
  { to: '/admin/catalog', label: 'Product catalog', end: false },
]

export function AdminLayout() {
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date())

  if (!ready) {
    return <p className="p-8 text-sm text-muted">Checking session…</p>
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="min-h-screen bg-[#eef1f8] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex flex-col bg-[#0c1222] text-white lg:min-h-screen">
        <div className="px-5 py-5">
          <Logo tone="light" />
          <p className="mt-1 text-xs text-slate-400">Admin workspace</p>
        </div>
        <p className="px-5 pb-2 text-[11px] font-semibold tracking-[0.16em] text-slate-500">WORKSPACE</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-copper text-white' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-copper text-xs font-bold">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <button
            type="button"
            className="mt-3 text-sm text-slate-400"
            onClick={() => {
              void logout().then(() => navigate('/admin/login'))
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-white/80 px-5 py-3">
          <p className="text-sm text-muted">Protected admin view</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">{today}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">{initials}</span>
          </div>
        </header>
        <Outlet />
        <p className="px-5 py-4 text-xs text-muted">
          <Link to="/" className="text-copper">View public site</Link>
          <span className="mx-2">·</span>
          <Link to="/admin/schedule">Technician calendar</Link>
        </p>
      </div>
    </div>
  )
}
