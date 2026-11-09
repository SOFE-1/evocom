import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Logo } from '../../components/Logo'
import { Eyebrow, buttonClass, cardClass, fieldClass, labelClass } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { errorText } from '../../lib/api'

export function LoginPage() {
  const { user, ready, login } = useAuth()
  const [email, setEmail] = useState('')
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
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative isolate hidden flex-col justify-between overflow-hidden bg-night p-12 text-white lg:flex">
        <img src="/media/wall.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20" />
        <div className="bg-grid absolute inset-0 -z-10" />
        <div className="absolute -bottom-40 -left-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-copper/30 blur-3xl" />
        <Link to="/" className="self-start">
          <Logo tone="light" />
        </Link>
        <div>
          <Eyebrow tone="light">Admin workspace</Eyebrow>
          <h2 className="mt-3 max-w-md text-4xl font-extrabold tracking-tight">Every request, payment, and site visit in one place.</h2>
        </div>
      </section>
      <div className="grid min-h-screen place-items-center px-4 py-10 lg:min-h-0">
        <form onSubmit={onSubmit} className={`w-full max-w-md p-8 ${cardClass}`}>
          <span className="lg:hidden">
            <Logo />
          </span>
          <h1 className="mt-6 text-3xl font-extrabold lg:mt-0">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Design requests and the product catalog.</p>
          <label className={`mt-6 ${labelClass}`}>
            Email
            <input className={`${fieldClass} mt-1.5`} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className={`mt-4 ${labelClass}`}>
            Password
            <input className={`${fieldClass} mt-1.5`} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={buttonClass('primary', 'mt-6 w-full py-3')}>
            {busy ? 'Signing in…' : 'Enter dashboard'}
          </button>
          <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-dark">
            <Icon name="arrow-left" className="h-4 w-4" />
            Back to the website
          </Link>
        </form>
      </div>
    </div>
  )
}
