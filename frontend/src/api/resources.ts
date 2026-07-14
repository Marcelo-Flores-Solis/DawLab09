import { http } from './client'
import type { Product, Category, Order, OrderDetail, Address, Paginated } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL

// La API está paginada (DRF devuelve { count, next, results }). Este helper
// recorre las páginas de forma transparente y devuelve la lista completa, para
// que las vistas (catálogo con filtro en cliente, tablas de admin) sigan
// recibiendo un arreglo como antes.
async function listAll<T>(resource: string): Promise<T[]> {
  const first = await http.get<Paginated<T> | T[]>(`/${resource}/?page_size=100`)
  if (Array.isArray(first)) return first // por si la paginación estuviera desactivada

  const results = [...first.results]
  let next = first.next
  while (next) {
    // `next` es una URL absoluta; la convertimos en ruta relativa a la base.
    const page = await http.get<Paginated<T>>(next.replace(BASE_URL, ''))
    results.push(...page.results)
    next = page.next
  }
  return results
}

// Fábrica genérica y tipada de servicios CRUD sobre `fetch`.
//   T       -> tipo de la entidad que devuelve el backend
//   Payload -> forma del cuerpo aceptado al crear/editar
function crudFor<T, Payload>(resource: string) {
  return {
    list: () => listAll<T>(resource),
    get: (id: number) => http.get<T>(`/${resource}/${id}/`),
    create: (data: Payload) => http.post<T>(`/${resource}/`, data),
    update: (id: number, data: Payload) => http.put<T>(`/${resource}/${id}/`, data),
    patch: (id: number, data: Partial<Payload>) => http.patch<T>(`/${resource}/${id}/`, data),
    remove: (id: number) => http.delete(`/${resource}/${id}/`),
  }
}

// Payloads de escritura (lo que enviamos, sin campos calculados por el servidor).
export interface ProductPayload {
  nombre: string
  descripcion: string
  precio: string
  stock: number
  categoria: number
  imagen: string
}

export interface CategoryPayload {
  nombre: string
  descripcion: string
}

export interface OrderPayload {
  usuario: number
  estado: string
}

export interface OrderDetailPayload {
  pedido: number
  producto: number
  cantidad: number
}

export interface AddressPayload {
  // El cliente no envía `usuario` (el backend lo toma del token). El panel de
  // administración sí puede indicarlo para crear a nombre de otro usuario.
  usuario?: number
  calle: string
  ciudad: string
  provincia: string
}

export const categoriesApi = crudFor<Category, CategoryPayload>('categorys')
export const productsApi = crudFor<Product, ProductPayload>('products')
export const ordersApi = crudFor<Order, OrderPayload>('orders')
export const orderDetailsApi = crudFor<OrderDetail, OrderDetailPayload>('order-details')
export const addressesApi = crudFor<Address, AddressPayload>('adresses')
