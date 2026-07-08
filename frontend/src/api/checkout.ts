import { http } from './client'
import type { CartItem, Order } from '../types'

/**
 * Crea un pedido real a partir del carrito:
 *  1. Crea el pedido (Order) asociado al usuario autenticado.
 *  2. Crea un detalle (OrderDetail) por cada producto del carrito.
 *
 * El id del usuario se obtiene del token JWT (no se envía desde un input),
 * de modo que un cliente sólo puede crear pedidos a su propio nombre.
 *
 * El precio unitario y el total NO se envían: el servidor toma el precio del
 * producto y recalcula el total sumando los detalles. Así el cliente no puede
 * falsear importes. Una vez creado, el pedido es inmutable para el cliente.
 */
export async function placeOrder(userId: number, items: CartItem[]): Promise<Order> {
  const order = await http.post<Order>('/orders/', {
    usuario: Number(userId),
    estado: 'pendiente',
  })

  for (const item of items) {
    await http.post('/order-details/', {
      pedido: order.id,
      producto: item.id,
      cantidad: item.cantidad,
    })
  }

  // El backend ya calculó el total; devolvemos el pedido actualizado.
  return http.get<Order>(`/orders/${order.id}/`)
}
