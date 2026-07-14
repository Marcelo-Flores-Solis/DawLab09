import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeOrder } from '../api/checkout'
import { queryKeys } from './queryKeys'
import type { CartItem } from '../types'

// Confirmación del pedido desde el carrito, como mutación de TanStack Query.
export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ items, direccion }: { items: CartItem[]; direccion?: number | null }) =>
      placeOrder(items, direccion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      qc.invalidateQueries({ queryKey: queryKeys.products })
    },
  })
}
