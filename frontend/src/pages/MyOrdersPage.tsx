import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { getUserId } from '../api/auth'
import type { OrderStatus } from '../types'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  enviado: 'Enviado',
}

export default function MyOrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders()
  const { data: products = [] } = useProducts()

  const productName = useMemo(() => {
    const map = new Map<number, string>()
    products.forEach((p) => map.set(p.id, p.nombre))
    return map
  }, [products])

  const myOrders = useMemo(() => {
    const userId = Number(getUserId())
    return orders.filter((o) => o.usuario === userId).sort((a, b) => b.id - a.id)
  }, [orders])

  if (isLoading) return <p className="muted page-pad">Cargando tus pedidos…</p>

  if (isError)
    return (
      <div className="page-pad">
        <p className="error">No se pudieron cargar tus pedidos.</p>
      </div>
    )

  if (myOrders.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">📦</span>
        <h2>Todavía no tienes pedidos</h2>
        <p className="muted">Cuando realices una compra, aparecerá aquí.</p>
        <Link to="/" className="add-btn cart-empty-cta">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">Mis pedidos</h1>
      <div className="orders-list">
        {myOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <h3>
                  Pedido <span className="order-code">#{order.id}</span>
                </h3>
                <span className="muted order-date">
                  {new Date(order.fecha).toLocaleString('es-PE')}
                </span>
              </div>
              <span className={`status-badge status-${order.estado}`}>
                {STATUS_LABEL[order.estado] ?? order.estado}
              </span>
            </div>
            <p className="muted order-code-hint">
              Guarda este código para consultar tu pedido más adelante.
            </p>

            <ul className="order-details">
              {order.detalles?.length ? (
                order.detalles.map((d) => (
                  <li key={d.id}>
                    <span>
                      {productName.get(d.producto) ?? `Producto #${d.producto}`} × {d.cantidad}
                    </span>
                    <span>S/ {Number(d.subtotal).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <li className="muted">Sin detalles.</li>
              )}
            </ul>

            {order.direccion_detalle && (
              <p className="muted order-shipping">
                🚚 Envío a: {order.direccion_detalle.calle}, {order.direccion_detalle.ciudad},{' '}
                {order.direccion_detalle.provincia}
              </p>
            )}

            <div className="order-total">
              <span>Total</span>
              <span>S/ {Number(order.total).toFixed(2)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
