import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeOrder } from '../api/checkout'
import { queryKeys } from './queryKeys'
import type { CartItem } from '../types'

// Confirmación del pedido desde el carrito, como mutación de TanStack Query.
export function useCheckout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, items }: { userId: number; items: CartItem[] }) =>
      placeOrder(userId, items),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders })
      // El stock cambia tras la compra: invalidamos también los productos.
      qc.invalidateQueries({ queryKey: queryKeys.products })
    },
  })
}
