import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi, productsApi } from '../api/resources'
import { getUserId } from '../api/auth'

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  enviado: 'Enviado',
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [allOrders, prods] = await Promise.all([ordersApi.list(), productsApi.list()])
        const userId = Number(getUserId())
        const mine = allOrders.filter((o) => o.usuario === userId)
        const prodMap = {}
        prods.forEach((p) => {
          prodMap[p.id] = p.nombre
        })
        setOrders(mine)
        setProducts(prodMap)
        setError(null)
      } catch {
        setError('No se pudieron cargar tus pedidos.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const sorted = useMemo(() => [...orders].sort((a, b) => b.id - a.id), [orders])

  if (loading) return <p className="muted page-pad">Cargando tus pedidos…</p>

  if (error)
    return (
      <div className="page-pad">
        <p className="error">{error}</p>
      </div>
    )

  if (sorted.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">📦</span>
        <h2>Todavía no tienes pedidos</h2>
        <p className="muted">Cuando realices una compra, aparecerá aquí.</p>
        <Link to="/" className="add-btn cart-empty-cta">Ir a la tienda</Link>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">Mis pedidos</h1>
      <div className="orders-list">
        {sorted.map((order) => (
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
                    <span>{products[d.producto] ?? `Producto #${d.producto}`} × {d.cantidad}</span>
                    <span>S/ {Number(d.subtotal).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <li className="muted">Sin detalles.</li>
              )}
            </ul>

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
