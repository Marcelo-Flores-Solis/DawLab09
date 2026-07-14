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
    // Intentamos extraer el mensaje del backend (DRF suele enviar `detail`),
    // para poder mostrar errores útiles como "Stock insuficiente…".
    let message = `Error ${res.status} al llamar a ${path}`
    try {
      // DRF envía los errores de varias formas: "texto", {"detail": ...},
      // ["texto"] (ValidationError), o {"campo": ["error", ...]}.
      const data = await res.json()
      const firstMessage = (value: unknown): string | null => {
        if (typeof value === 'string') return value
        if (Array.isArray(value)) return firstMessage(value[0])
        if (value && typeof value === 'object') {
          const obj = value as Record<string, unknown>
          if ('detail' in obj) return firstMessage(obj.detail)
          const first = Object.values(obj)[0]
          if (first !== undefined) return firstMessage(first)
        }
        return null
      }
      message = firstMessage(data) ?? message
    } catch {
      // Sin cuerpo JSON: nos quedamos con el mensaje genérico.
    }
    throw new Error(message)
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
