import { useState, type FormEvent } from 'react'
import { useOrders, useCreateOrder, useCreateOrderDetail, useUpdateOrderStatus, useDeleteOrder, useDeleteOrderDetail } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import type { Order, OrderStatus } from '../types'

const ESTADOS: OrderStatus[] = ['pendiente', 'pagado', 'enviado']

interface DraftLine {
  producto: string
  cantidad: string
}

const emptyLine: DraftLine = { producto: '', cantidad: '1' }

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError } = useOrders()
  const { data: products = [] } = useProducts()

  const createOrder = useCreateOrder()
  const createOrderDetail = useCreateOrderDetail()
  const updateStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const deleteOrderDetail = useDeleteOrderDetail()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // --- Formulario unificado: crear pedido CON sus líneas de una sola vez ---
  const [usuario, setUsuario] = useState('')
  const [estado, setEstado] = useState<OrderStatus>('pendiente')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [lineDraft, setLineDraft] = useState<DraftLine>(emptyLine)

  // --- Edición de un pedido existente (sólo admin) ---
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEstado, setEditEstado] = useState<OrderStatus>('pendiente')
  const [editLine, setEditLine] = useState<DraftLine>(emptyLine)

  const busy =
    createOrder.isPending ||
    createOrderDetail.isPending ||
    updateStatus.isPending ||
    deleteOrder.isPending ||
    deleteOrderDetail.isPending

  const productName = (id: number | string) =>
    products.find((p) => p.id === Number(id))?.nombre ?? `Producto #${id}`
  const productPrice = (id: number | string) =>
    Number(products.find((p) => p.id === Number(id))?.precio ?? 0)

  function flash(msg: string) {
    setSuccess(msg)
    setError(null)
  }

  // ---------- Crear pedido + líneas ----------
  function addLineToDraft() {
    if (!lineDraft.producto || Number(lineDraft.cantidad) < 1) return
    setLines([...lines, { producto: lineDraft.producto, cantidad: lineDraft.cantidad }])
    setLineDraft(emptyLine)
  }

  function removeDraftLine(idx: number) {
    setLines(lines.filter((_, i) => i !== idx))
  }

  const draftTotal = lines.reduce(
    (sum, l) => sum + productPrice(l.producto) * Number(l.cantidad),
    0
  )

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usuario) return
    setError(null)
    setSuccess(null)
    try {
      const order = await createOrder.mutateAsync({ usuario: Number(usuario), estado })
      for (const l of lines) {
        await createOrderDetail.mutateAsync({
          pedido: order.id,
          producto: Number(l.producto),
          cantidad: Number(l.cantidad),
        })
      }
      setUsuario('')
      setEstado('pendiente')
      setLines([])
      setLineDraft(emptyLine)
      flash(`Pedido #${order.id} creado con ${lines.length} producto(s).`)
    } catch {
      setError('Error al crear el pedido. Verifica que el ID de usuario exista (Django Admin).')
    }
  }

  // ---------- Editar pedido existente ----------
  function startEdit(order: Order) {
    setEditingId(order.id)
    setEditEstado(order.estado)
    setEditLine(emptyLine)
    setError(null)
    setSuccess(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLine(emptyLine)
  }

  async function saveEstado(orderId: number) {
    try {
      await updateStatus.mutateAsync({ id: orderId, estado: editEstado })
      flash(`Pedido #${orderId} actualizado.`)
    } catch {
      setError('No se pudo actualizar el estado.')
    }
  }

  async function addLineToOrder(orderId: number) {
    if (!editLine.producto || Number(editLine.cantidad) < 1) return
    try {
      await createOrderDetail.mutateAsync({
        pedido: orderId,
        producto: Number(editLine.producto),
        cantidad: Number(editLine.cantidad),
      })
      setEditLine(emptyLine)
      flash(`Producto agregado al pedido #${orderId}.`)
    } catch {
      setError('No se pudo agregar el producto.')
    }
  }

  async function removeLineFromOrder(detailId: number, orderId: number) {
    if (!confirm('¿Quitar este producto del pedido?')) return
    try {
      await deleteOrderDetail.mutateAsync(detailId)
      flash(`Producto quitado del pedido #${orderId}.`)
    } catch {
      setError('No se pudo quitar el producto.')
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!confirm('¿Eliminar este pedido y sus detalles?')) return
    try {
      await deleteOrder.mutateAsync(id)
      flash('Pedido eliminado.')
    } catch {
      setError('No se pudo eliminar el pedido.')
    }
  }

  return (
    <div>
      <h2>Pedidos</h2>
      {(isError || error) && <p className="error">{error ?? 'No se pudo conectar con la API.'}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">
        No hay endpoint de usuarios expuesto: usa el ID de un usuario existente (ver Django Admin en{' '}
        <code>/admin/</code>). El precio y el total se calculan en el servidor.
      </p>

      {/* Crear pedido y llenarlo en un solo formulario */}
      <form className="card form" onSubmit={handleCreate}>
        <h3>Nuevo pedido</h3>
        <input
          type="number"
          min="1"
          placeholder="ID de usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value as OrderStatus)}>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="line-builder">
          <select
            value={lineDraft.producto}
            onChange={(e) => setLineDraft({ ...lineDraft, producto: e.target.value })}
          >
            <option value="">Selecciona producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — S/. {p.precio}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Cant."
            value={lineDraft.cantidad}
            onChange={(e) => setLineDraft({ ...lineDraft, cantidad: e.target.value })}
          />
          <button type="button" onClick={addLineToDraft}>
            Añadir producto
          </button>
        </div>

        {lines.length > 0 && (
          <ul className="draft-lines">
            {lines.map((l, i) => (
              <li key={i}>
                <span>
                  {productName(l.producto)} × {l.cantidad}
                </span>
                <span>S/. {(productPrice(l.producto) * Number(l.cantidad)).toFixed(2)}</span>
                <button type="button" className="line-remove" onClick={() => removeDraftLine(i)}>
                  ✕
                </button>
              </li>
            ))}
            <li className="draft-total">
              <span>Total estimado</span>
              <span>S/. {draftTotal.toFixed(2)}</span>
            </li>
          </ul>
        )}

        <div className="actions">
          <button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Guardando...' : 'Crear pedido'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="hint">Aún no hay pedidos. Crea uno con el formulario de arriba.</p>
      ) : (
        <div className="cards-grid">
          {orders.map((order) => {
            const editing = editingId === order.id
            return (
              <div className="card" key={order.id}>
                <div className="row-actions">
                  <h3>
                    Pedido <span className="id-chip">#{order.id}</span>
                  </h3>
                  <div className="card-btns">
                    {editing ? (
                      <button onClick={cancelEdit}>Cerrar</button>
                    ) : (
                      <button onClick={() => startEdit(order)}>Editar</button>
                    )}
                    <button onClick={() => handleDeleteOrder(order.id)} disabled={busy}>
                      Eliminar
                    </button>
                  </div>
                </div>

                <p className="order-meta">
                  Usuario ID: {order.usuario} · {new Date(order.fecha).toLocaleString()} ·{' '}
                  <span className={`status-badge status-${order.estado}`}>{order.estado}</span>
                </p>
                <p>
                  <strong>Total: S/. {Number(order.total).toFixed(2)}</strong>
                </p>

                <strong>Detalles</strong>
                {order.detalles?.length ? (
                  <ul className="order-detail-list">
                    {order.detalles.map((d) => (
                      <li key={d.id}>
                        <span>
                          {productName(d.producto)} × {d.cantidad} — S/. {Number(d.subtotal).toFixed(2)}
                        </span>
                        {editing && (
                          <button
                            className="line-remove"
                            onClick={() => removeLineFromOrder(d.id, order.id)}
                            disabled={busy}
                          >
                            ✕
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="hint">Sin productos todavía.</p>
                )}

                {editing && (
                  <div className="order-editor">
                    <div className="line-builder">
                      <select
                        value={editEstado}
                        onChange={(e) => setEditEstado(e.target.value as OrderStatus)}
                      >
                        {ESTADOS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => saveEstado(order.id)} disabled={busy}>
                        Guardar estado
                      </button>
                    </div>
                    <div className="line-builder">
                      <select
                        value={editLine.producto}
                        onChange={(e) => setEditLine({ ...editLine, producto: e.target.value })}
                      >
                        <option value="">Agregar producto…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — S/. {p.precio}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={editLine.cantidad}
                        onChange={(e) => setEditLine({ ...editLine, cantidad: e.target.value })}
                      />
                      <button onClick={() => addLineToOrder(order.id)} disabled={busy}>
                        Añadir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
