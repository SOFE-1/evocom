import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from '../lib/api'
import type { StaffUser } from '../types'

type AuthValue = {
  user: StaffUser | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!getToken()) {
      setReady(true)
      return
    }

    let cancelled = false
    api<{ data: StaffUser }>('/auth/me')
      .then((result) => {
        if (!cancelled) {
          setUser(result.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      login: async (email, password) => {
        const result = await api<{ token: string; user: StaffUser }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setToken(result.token)
        setUser(result.user)
      },
      logout: async () => {
        try {
          await api('/auth/logout', { method: 'POST' })
        } finally {
          setToken(null)
          setUser(null)
        }
      },
    }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
