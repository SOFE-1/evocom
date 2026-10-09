const configured = import.meta.env.VITE_API_URL as string | undefined
const API_URL =
  configured && !/localhost|127\.0\.0\.1/.test(configured)
    ? configured
    : `http://${window.location.hostname}:8000/api`
const TOKEN_KEY = 'evocom_token'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function errorText(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const first = error.errors ? Object.values(error.errors)[0]?.[0] : undefined
    return first ?? error.message
  }

  if (error instanceof TypeError) {
    return 'The API is not running. Start the Laravel server, then try again.'
  }

  return fallback
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()

  headers.set('Accept', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers })
  } catch (error) {
    if (error instanceof TypeError) {
      throw error
    }
    throw new Error('The API could not be reached.')
  }

  const text = await response.text()
  const payload = text ? (JSON.parse(text) as { message?: string; errors?: Record<string, string[]> }) : null

  if (response.status === 401 && token && !path.startsWith('/auth/login')) {
    setToken(null)
    if (!window.location.pathname.startsWith('/admin/login')) {
      window.location.assign('/admin/login')
    }
  }

  if (!response.ok) {
    throw new ApiError(payload?.message ?? 'Request failed', response.status, payload?.errors)
  }

  return payload as T
}
