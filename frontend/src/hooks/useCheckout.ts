import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeOrder } from '../api/checkout'
import { queryKeys } from './queryKeys'
import type { CartItem, PaymentMethod } from '../types'

// Confirmación del pedido desde el carrito, como mutación de TanStack Query.
export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      items,
      direccion,
      metodoPago,
    }: {
      items: CartItem[]
      direccion?: number | null
      metodoPago?: PaymentMethod
    }) => placeOrder(items, direccion, metodoPago),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.products })
      // El crédito cambió: refrescamos el perfil para reflejar el nuevo saldo.
      qc.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}
