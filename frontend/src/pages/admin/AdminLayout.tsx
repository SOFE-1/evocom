import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { AdminNotifications } from '../../components/AdminNotifications'
import { Icon, type IconName } from '../../components/Icon'
import { Logo } from '../../components/Logo'
import { useAuth } from '../../context/AuthContext'

const links: Array<{ to: string; label: string; end: boolean; icon: IconName }> = [
  { to: '/admin', label: 'Design requests', end: true, icon: 'inbox' },
  { to: '/admin/payments', label: 'Payment history', end: false, icon: 'receipt' },
  { to: '/admin/schedule', label: 'Technician calendar', end: false, icon: 'calendar' },
  { to: '/admin/catalog', label: 'Product catalog', end: false, icon: 'layers' },
  { to: '/admin/sales', label: 'Monthly sales', end: false, icon: 'receipt' },
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
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <p className="inline-flex items-center gap-3 text-sm text-muted">
          <span className="h-2 w-2 animate-rec rounded-full bg-copper" />
          Checking session…
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  function signOut() {
    void logout().then(() => navigate('/admin/login'))
  }

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="bg-night text-white print:hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-5">
          <Link to="/admin">
            <Logo tone="light" sub="Admin workspace" />
          </Link>
          <button
            type="button"
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-slate-300 lg:hidden"
            onClick={signOut}
          >
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
        <p className="hidden px-5 pt-2 pb-2 font-mono text-[11px] font-medium tracking-[0.16em] text-slate-500 lg:block">WORKSPACE</p>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  isActive ? 'bg-copper text-white shadow-md shadow-copper/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon name={link.icon} className="h-[18px] w-[18px]" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-copper text-xs font-bold">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
          </div>
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            onClick={signOut}
          >
            <Icon name="logout" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Icon name="shield-check" className="h-4 w-4 text-copper" />
            Protected admin view
          </p>
          <div className="flex items-center gap-5 text-sm">
            <AdminNotifications />
            <span className="hidden text-muted md:inline">{today}</span>
            <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-copper transition hover:text-copper-dark">
              View public site
              <Icon name="external" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
