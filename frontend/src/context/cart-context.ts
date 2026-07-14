import { createContext } from 'react'
import type { CartItem, Product } from '../types'

export interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  setQty: (id: number, cantidad: number) => void
  removeItem: (id: number) => void
  clear: () => void
  syncWith: (products: Product[]) => void
  count: number
  total: number
}

// El objeto Context vive en su propio módulo para que CartContext.tsx sólo
// exporte el componente Provider (react-refresh / fast refresh).
export const CartContext = createContext<CartContextValue | null>(null)
