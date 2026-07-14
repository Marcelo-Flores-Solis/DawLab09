import { http } from './client'
import type { Profile } from '../types'

// Perfil del usuario autenticado. Es un recurso único (no una colección):
// siempre el del token. El backend lo crea vacío al primer acceso.
export const profileApi = {
  get: () => http.get<Profile>('/profile/'),
  update: (data: Partial<Profile>) => http.patch<Profile>('/profile/', data),
}
