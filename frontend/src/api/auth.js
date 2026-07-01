import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

export function login(username, password) {
  return axios.post(`${baseURL}/token/`, { username, password }).then((res) => {
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    localStorage.setItem('username', username)
    return res.data
  })
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
}

export function getAccessToken() {
  return localStorage.getItem('access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

export function getUsername() {
  return localStorage.getItem('username')
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

// Decodifica el payload del JWT sin verificar la firma (sólo para leer claims
// no sensibles en el cliente; la autoridad real la tiene el backend).
function decodeToken() {
  const token = getAccessToken()
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

// Id del usuario autenticado, tomado del token (no de un input) para que un
// cliente sólo pueda operar a su propio nombre.
export function getUserId() {
  return decodeToken()?.user_id ?? null
}

// Rol: ¿es staff/administrador? Se usa para mostrar y proteger el panel admin.
export function getIsStaff() {
  return Boolean(decodeToken()?.is_staff)
}

export function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return Promise.reject(new Error('No hay refresh token'))
  return axios.post(`${baseURL}/token/refresh/`, { refresh }).then((res) => {
    localStorage.setItem('access_token', res.data.access)
    return res.data.access
  })
}
