import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { fieldClass } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { errorText } from '../../lib/api'

export function LoginPage() {
  const { user, ready, login } = useAuth()
  const [email, setEmail] = useState('admin@evocom.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (ready && user) {
    return <Navigate to="/admin" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (loginError) {
      setError(errorText(loginError, 'Sign-in failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Design requests and the product catalog.</p>
        <label className="mt-6 block text-sm font-medium">
          Email
          <input className={`${fieldClass} mt-1.5`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input className={`${fieldClass} mt-1.5`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 w-full rounded-lg bg-copper py-3 text-sm font-semibold text-white hover:bg-copper-dark disabled:opacity-60">
          {busy ? 'Signing in…' : 'Enter dashboard'}
        </button>
        <p className="mt-4 text-xs text-muted">Local sign-in: admin@evocom.local / password</p>
      </form>
    </div>
  )
}
