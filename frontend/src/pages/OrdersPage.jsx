import { useEffect, useState } from 'react'
import { ordersApi, orderDetailsApi, productsApi } from '../api/resources'

const emptyOrderForm = { usuario: '', estado: 'pendiente' }
const emptyDetailForm = { pedido: '', producto: '', cantidad: '', precio_unitario: '' }

const ESTADOS = ['pendiente', 'pagado', 'enviado']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [orderForm, setOrderForm] = useState(emptyOrderForm)
  const [detailForm, setDetailForm] = useState(emptyDetailForm)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [savingDetail, setSavingDetail] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        ordersApi.list(),
        productsApi.list(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
      setError(null)
    } catch (err) {
      setError('No se pudo conectar con la API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreateOrder(e) {
    e.preventDefault()
    setSavingOrder(true)
    setError(null)
    setSuccess(null)
    try {
      await ordersApi.create({ usuario: Number(orderForm.usuario), estado: orderForm.estado })
      setOrderForm(emptyOrderForm)
      setSuccess('Pedido creado.')
      await load()
    } catch (err) {
      setError('Error al crear el pedido. Verifica que el ID de usuario exista (admin de Django).')
    } finally {
      setSavingOrder(false)
    }
  }

  async function handleAddDetail(e) {
    e.preventDefault()
    const product = products.find((p) => p.id === Number(detailForm.producto))
    setSavingDetail(true)
    setError(null)
    setSuccess(null)
    try {
      await orderDetailsApi.create({
        pedido: Number(detailForm.pedido),
        producto: Number(detailForm.producto),
        cantidad: Number(detailForm.cantidad),
        precio_unitario: detailForm.precio_unitario || product?.precio,
      })
      setDetailForm(emptyDetailForm)
      setSuccess('Detalle agregado al pedido.')
      await load()
    } catch (err) {
      setError('Error al agregar el detalle. Verifica que el ID de pedido exista.')
    } finally {
      setSavingDetail(false)
    }
  }

  async function handleDeleteOrder(id) {
    if (!confirm('¿Eliminar este pedido y sus detalles?')) return
    await ordersApi.remove(id)
    setSuccess('Pedido eliminado.')
    load()
  }

  function productName(id) {
    return products.find((p) => p.id === id)?.nombre ?? `Producto #${id}`
  }

  return (
    <div>
      <h2>Pedidos</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">
        No hay endpoint de usuarios expuesto: usa el ID de un usuario existente (ver Django Admin en <code>/admin/</code>).
      </p>

      <form className="card form" onSubmit={handleCreateOrder}>
        <h3>Nuevo pedido</h3>
        <input
          type="number"
          min="1"
          placeholder="ID de usuario"
          value={orderForm.usuario}
          onChange={(e) => setOrderForm({ ...orderForm, usuario: e.target.value })}
          required
        />
        <select
          value={orderForm.estado}
          onChange={(e) => setOrderForm({ ...orderForm, estado: e.target.value })}
        >
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="actions">
          <button type="submit" disabled={savingOrder}>{savingOrder ? 'Guardando...' : 'Crear pedido'}</button>
        </div>
      </form>

      <form className="card form" onSubmit={handleAddDetail}>
        <h3>Agregar producto a un pedido</h3>
        <input
          type="number"
          min="1"
          placeholder="ID de pedido"
          value={detailForm.pedido}
          onChange={(e) => setDetailForm({ ...detailForm, pedido: e.target.value })}
          required
        />
        <select
          value={detailForm.producto}
          onChange={(e) => setDetailForm({ ...detailForm, producto: e.target.value })}
          required
        >
          <option value="">Selecciona producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} — S/. {p.precio}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Cantidad"
          value={detailForm.cantidad}
          onChange={(e) => setDetailForm({ ...detailForm, cantidad: e.target.value })}
          required
        />
        <div className="actions">
          <button type="submit" disabled={savingDetail}>{savingDetail ? 'Guardando...' : 'Agregar detalle'}</button>
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="hint">Aún no hay pedidos. Crea uno con el formulario de arriba.</p>
      ) : (
        <div className="cards-grid">
          {orders.map((order) => (
            <div className="card" key={order.id}>
              <div className="row-actions">
                <h3>Pedido #{order.id} — {order.estado}</h3>
                <button onClick={() => handleDeleteOrder(order.id)}>Eliminar</button>
              </div>
              <p>Usuario ID: {order.usuario} · Fecha: {new Date(order.fecha).toLocaleString()}</p>
              <p>Total: S/. {order.total}</p>
              <strong>Detalles</strong>
              {order.detalles?.length ? (
                <ul>
                  {order.detalles.map((d) => (
                    <li key={d.id}>{productName(d.producto)} x{d.cantidad} — S/. {d.subtotal}</li>
                  ))}
                </ul>
              ) : (
                <p className="hint">Sin productos todavía.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
