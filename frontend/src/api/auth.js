import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL

export function login(username, password) {
  return axios.post(`${baseURL}/token/`, { username, password }).then((res) => {
    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)
    return res.data
  })
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken() {
  return localStorage.getItem('access_token')
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return Promise.reject(new Error('No hay refresh token'))
  return axios.post(`${baseURL}/token/refresh/`, { refresh }).then((res) => {
    localStorage.setItem('access_token', res.data.access)
    return res.data.access
  })
}
