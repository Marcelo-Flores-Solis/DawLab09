import { http } from './client'
import type { CartItem, Order } from '../types'

/**
 * Confirma el carrito como un único pedido llamando al endpoint atómico
 * `POST /orders/checkout/`.
 *
 * Una sola petición crea el pedido y todas sus líneas dentro de una
 * transacción en el servidor: si algo falla (p. ej. stock insuficiente) no
 * queda ningún pedido a medias. El usuario se toma del token JWT y el precio
 * de cada producto se fija en el servidor, así el cliente no puede falsear
 * importes ni comprar a nombre de otro.
 */
export async function placeOrder(
  items: CartItem[],
  direccion?: number | null
): Promise<Order> {
  return http.post<Order>('/orders/checkout/', {
    items: items.map((item) => ({ producto: item.id, cantidad: item.cantidad })),
    ...(direccion != null ? { direccion } : {}),
  })
}
