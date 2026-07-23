import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { getUserId } from '../api/auth'

export default function MyOrdersPage() {
  const { t } = useTranslation()
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

  if (isLoading) return <p className="muted page-pad">{t('myOrders.loading')}</p>

  if (isError)
    return (
      <div className="page-pad">
        <p className="error">{t('myOrders.loadError')}</p>
      </div>
    )

  if (myOrders.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">📦</span>
        <h2>{t('myOrders.emptyTitle')}</h2>
        <p className="muted">{t('myOrders.emptyText')}</p>
        <Link to="/" className="add-btn cart-empty-cta">
          {t('common.goToStore')}
        </Link>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <h1 className="page-title">{t('myOrders.title')}</h1>
      <div className="orders-list">
        {myOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <h3>
                  {t('orders.orderLabel')} <span className="order-code">#{order.id}</span>
                </h3>
                <span className="muted order-date">
                  {new Date(order.fecha).toLocaleString()}
                </span>
              </div>
              <span className={`status-badge status-${order.estado}`}>
                {t(`status.${order.estado}`)}
              </span>
            </div>
            <p className="muted order-code-hint">{t('myOrders.codeHint')}</p>

            <ul className="order-details">
              {order.detalles?.length ? (
                order.detalles.map((d) => (
                  <li key={d.id}>
                    <span>
                      {productName.get(d.producto) ?? t('orders.productFallback', { id: d.producto })} × {d.cantidad}
                    </span>
                    <span>S/ {Number(d.subtotal).toFixed(2)}</span>
                  </li>
                ))
              ) : (
                <li className="muted">{t('myOrders.noDetails')}</li>
              )}
            </ul>

            {order.direccion_detalle && (
              <p className="muted order-shipping">
                🚚{' '}
                {t('myOrders.shippingTo', {
                  address: `${order.direccion_detalle.calle}, ${order.direccion_detalle.ciudad}, ${order.direccion_detalle.provincia}`,
                })}
              </p>
            )}

            <div className="order-total">
              <span>{t('common.total')}</span>
              <span>S/ {Number(order.total).toFixed(2)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
