// Modelos del backend (Django REST Framework) tipados para el frontend.
// Requisito 5: tipado estricto mediante interfaces, sin uso de `any`.

export interface Category {
  id: number
  nombre: string
  descripcion: string
  // El serializer anida los productos de la categoría (opcional en algunas vistas).
  productos?: Product[]
}

export interface Product {
  id: number
  nombre: string
  descripcion: string
  precio: string // DRF DecimalField se serializa como string
  stock: number
  categoria: number // FK -> Category.id
  imagen: string | null
}

export type OrderStatus = 'pendiente' | 'pagado' | 'enviado'

export interface OrderDetail {
  id: number
  pedido: number // FK -> Order.id
  producto: number // FK -> Product.id
  cantidad: number
  subtotal: string
}

export interface Order {
  id: number
  usuario: number // FK -> User.id
  estado: OrderStatus
  fecha: string
  total: string
  detalles?: OrderDetail[]
}

export interface Address {
  id: number
  usuario: number
  calle: string
  ciudad: string
  provincia: string
}

// Ítem del carrito local (persistido en localStorage, no viene del backend).
export interface CartItem {
  id: number
  nombre: string
  precio: string
  stock: number
  categoria: number
  imagen: string | null
  cantidad: number
}

// Respuesta de los endpoints de autenticación JWT (SimpleJWT).
export interface TokenPair {
  access: string
  refresh: string
}

// Claims que leemos del JWT en el cliente.
export interface JwtClaims {
  user_id: number
  is_staff?: boolean
  exp: number
  [claim: string]: unknown
}
