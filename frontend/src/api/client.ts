import { getAccessToken, refreshAccessToken, logout } from './auth'

// Cliente HTTP basado en `fetch` nativo (Requisito 4: prohibido Axios).
// Encapsula: base URL, cabecera JSON, token Bearer y refresh automático en 401.
const BASE_URL = import.meta.env.VITE_API_URL

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = options

  const doFetch = (token: string | null): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

  let res = await doFetch(auth ? getAccessToken() : null)

  // Si el token expiró, intentamos refrescar una vez y reintentar (equivalente
  // al interceptor de respuesta que antes vivía en Axios).
  if (res.status === 401 && auth) {
    try {
      const newToken = await refreshAccessToken()
      res = await doFetch(newToken)
    } catch (err) {
      logout()
      window.location.href = '/login'
      throw err
    }
  }

  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar a ${path}`)
  }

  // 204 No Content (típico en DELETE) no trae cuerpo JSON.
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
}
