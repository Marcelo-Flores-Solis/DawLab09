import type { JwtClaims, TokenPair } from '../types'

const baseURL = import.meta.env.VITE_API_URL

// Autenticación JWT contra el backend usando fetch nativo (sin Axios).
export async function login(username: string, password: string): Promise<TokenPair> {
  const res = await fetch(`${baseURL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Credenciales inválidas')

  const data = (await res.json()) as TokenPair
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  localStorage.setItem('username', username)
  return data
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

export function getUsername(): string | null {
  return localStorage.getItem('username')
}

// se considera expirado.
function isJwtExpired(token: string | null): boolean {
  if (!token) return true
  try {
    const payload = token.split('.')[1]
    const { exp } = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    ) as { exp?: number }
    if (!exp) return false // sin exp no podemos afirmar que expiró
    return exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function isAuthenticated(): boolean {

  return !isJwtExpired(getAccessToken()) || !isJwtExpired(getRefreshToken())
}

function decodeToken(): JwtClaims | null {
  const token = getAccessToken()
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtClaims
  } catch {
    return null
  }
}


export function getUserId(): number | null {
  return decodeToken()?.user_id ?? null
}

export function getIsStaff(): boolean {
  return Boolean(decodeToken()?.is_staff)
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('No hay refresh token')

  const res = await fetch(`${baseURL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) throw new Error('No se pudo refrescar la sesión')

  const data = (await res.json()) as { access: string }
  localStorage.setItem('access_token', data.access)
  return data.access
}
