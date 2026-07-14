import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '../api/profile'
import { isAuthenticated } from '../api/auth'
import { queryKeys } from './queryKeys'
import type { Profile } from '../types'

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.get,
    enabled: isAuthenticated(),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Profile>) => profileApi.update(data),
    onSuccess: (profile) => {
      // El backend devuelve el perfil actualizado; lo dejamos en caché.
      qc.setQueryData(queryKeys.profile, profile)
    },
  })
}
