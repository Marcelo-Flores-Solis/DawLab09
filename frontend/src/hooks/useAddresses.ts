import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressesApi, type AddressPayload } from '../api/resources'
import { isAuthenticated } from '../api/auth'
import { queryKeys } from './queryKeys'

export function useAddresses() {
  // Requiere sesión: sin token, evitamos disparar la petición (y el 401 que
  // forzaría un logout) cuando se ve el carrito como invitado.
  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: addressesApi.list,
    enabled: isAuthenticated(),
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddressPayload) => addressesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => addressesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  })
}
