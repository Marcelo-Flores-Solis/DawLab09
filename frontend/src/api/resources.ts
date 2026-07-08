import { http } from './client'
import type { Product, Category, Order, OrderDetail, Address } from '../types'

// Fábrica genérica y tipada de servicios CRUD sobre `fetch`.
//   T       -> tipo de la entidad que devuelve el backend
//   Payload -> forma del cuerpo aceptado al crear/editar
function crudFor<T, Payload>(resource: string) {
  return {
    list: () => http.get<T[]>(`/${resource}/`),
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
  usuario: number
  calle: string
  ciudad: string
  provincia: string
}

export const categoriesApi = crudFor<Category, CategoryPayload>('categorys')
export const productsApi = crudFor<Product, ProductPayload>('products')
export const ordersApi = crudFor<Order, OrderPayload>('orders')
export const orderDetailsApi = crudFor<OrderDetail, OrderDetailPayload>('order-details')
export const addressesApi = crudFor<Address, AddressPayload>('adresses')
