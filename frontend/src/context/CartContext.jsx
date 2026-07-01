import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

// Carrito por navegador (permite comprar como invitado y conservar los
// productos al iniciar sesión en el checkout). Se vacía al cerrar sesión.
const STORAGE_KEY = 'cart'

function loadInitial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1) => {
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
          cantidad: Math.min(qty, product.stock),
        },
      ]
    })
  }, [])

  const setQty = useCallback((id, cantidad) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, Math.min(cantidad, p.stock)) } : p
      )
    )
  }, [])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((n, p) => n + p.cantidad, 0)
  const total = items.reduce((sum, p) => sum + Number(p.precio) * p.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
