import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getUserId, isAuthenticated } from '../api/auth'
import { placeOrder } from '../api/checkout'
import ProductThumb from '../components/ProductThumb'

export default function CartPage() {
  const { items, setQty, removeItem, clear, total } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)

  async function handleCheckout() {
    // Gate de compra: navegar es libre, pero para confirmar el pedido
    // hace falta iniciar sesión. Volvemos al carrito tras autenticarse.
    if (!isAuthenticated()) {
      notify('Inicia sesión para completar tu compra', 'error')
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    const userId = getUserId()
    if (!userId) {
      notify('No se pudo identificar tu sesión. Vuelve a iniciar sesión.', 'error')
      return
    }
    setPlacing(true)
    try {
      const order = await placeOrder(userId, items)
      clear()
      notify(`Pedido #${order.id} realizado con éxito`)
      navigate('/mis-pedidos')
    } catch {
      notify('Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.', 'error')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Explora la tienda y agrega productos para realizar tu pedido.</p>
        <Link to="/" className="add-btn cart-empty-cta">Ir a la tienda</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Tu carrito</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <ProductThumb id={item.id} size="mini" imageUrl={item.imagen} />
              <div className="cart-item-info">
                <h3>{item.nombre}</h3>
                <span className="product-price">S/ {Number(item.precio).toFixed(2)}</span>
              </div>

              <div className="qty-stepper">
                <button onClick={() => setQty(item.id, item.cantidad - 1)} aria-label="Restar">−</button>
                <span>{item.cantidad}</span>
                <button onClick={() => setQty(item.id, item.cantidad + 1)} aria-label="Sumar">+</button>
              </div>

              <span className="cart-item-subtotal">
                S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
              </span>

              <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Quitar">
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Productos</span>
            <span>{items.reduce((n, p) => n + p.cantidad, 0)}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
          <button className="add-btn checkout-btn" onClick={handleCheckout} disabled={placing}>
            {placing
              ? 'Procesando…'
              : isAuthenticated()
                ? 'Confirmar pedido'
                : 'Iniciar sesión para comprar'}
          </button>
          <Link to="/" className="continue-link">← Seguir comprando</Link>
        </aside>
      </div>
    </div>
  )
}
