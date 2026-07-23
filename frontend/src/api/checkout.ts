import { http } from './client'
import type { CartItem, Order, PaymentMethod } from '../types'


export async function placeOrder(
  items: CartItem[],
  direccion?: number | null,
  metodoPago: PaymentMethod = 'credito'
): Promise<Order> {
  return http.post<Order>('/orders/checkout/', {
    items: items.map((item) => ({
      producto: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
    })),
    metodo_pago: metodoPago,
    ...(direccion != null ? { direccion } : {}),
  })
}
