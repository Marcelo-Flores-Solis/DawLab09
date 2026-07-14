import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CartItem, Product } from '../types'
import { CartContext } from './cart-context'

// Carrito por navegador (permite comprar como invitado y conservar los
// productos al iniciar sesión en el checkout). Se vacía al cerrar sesión.
const STORAGE_KEY = 'cart'

function loadInitial(): CartItem[] {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[]) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id)
      if (existing) {
        const cantidad = Math.min(existing.cantidad + qty, product.stock)
        return prev.map((p) => (p.id === product.id ? { ...p, cantidad } : p))
      }
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          stock: product.stock,
          categoria: product.categoria,
          imagen: product.imagen,
          cantidad: Math.min(qty, product.stock),
        },
      ]
    })
  }, [])

  const setQty = useCallback((id: number, cantidad: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, Math.min(cantidad, p.stock)) } : p
      )
    )
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  // Reconcilia el carrito con los datos actuales del backend: actualiza precio y
  // stock, recorta la cantidad al stock disponible y descarta productos que ya
  // no existen o quedaron sin stock. Evita comprar con precios desactualizados.
  const syncWith = useCallback((products: Product[]) => {
    const byId = new Map(products.map((p) => [p.id, p]))
    setItems((prev) =>
      prev
        .map((it) => {
          const p = byId.get(it.id)
          if (!p) return null
          return {
            ...it,
            nombre: p.nombre,
            precio: p.precio,
            stock: p.stock,
            categoria: p.categoria,
            imagen: p.imagen,
            cantidad: Math.min(it.cantidad, p.stock),
          }
        })
        .filter((it): it is CartItem => it !== null && it.cantidad > 0)
    )
  }, [])

  const count = items.reduce((n, p) => n + p.cantidad, 0)
  const total = items.reduce((sum, p) => sum + Number(p.precio) * p.cantidad, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, setQty, removeItem, clear, syncWith, count, total }}
    >
      {children}
    </CartContext.Provider>
  )
}
