import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrders, useCreateOrder, useCreateOrderDetail, useUpdateOrder, useDeleteOrder, useDeleteOrderDetail } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { useAddresses } from '../hooks/useAddresses'
import type { Address, Order, OrderStatus } from '../types'

function formatAddress(a: Address): string {
  return `${a.calle} — ${a.ciudad}, ${a.provincia}`
}

const ESTADOS: OrderStatus[] = ['pendiente', 'pagado', 'enviado']

interface DraftLine {
  producto: string
  cantidad: string
}

const emptyLine: DraftLine = { producto: '', cantidad: '1' }

export default function OrdersPage() {
  const { t } = useTranslation()
  const { data: orders = [], isLoading, isError } = useOrders()
  const { data: products = [] } = useProducts()
  const { data: addresses = [] } = useAddresses()

  const createOrder = useCreateOrder()
  const createOrderDetail = useCreateOrderDetail()
  const updateOrder = useUpdateOrder()
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
  const [editUsuario, setEditUsuario] = useState('')
  const [editDireccion, setEditDireccion] = useState('') // '' = sin dirección
  const [editLine, setEditLine] = useState<DraftLine>(emptyLine)

  const busy =
    createOrder.isPending ||
    createOrderDetail.isPending ||
    updateOrder.isPending ||
    deleteOrder.isPending ||
    deleteOrderDetail.isPending

  const addressLabel = (id: number | null | undefined) => {
    if (id == null) return null
    const a = addresses.find((x) => x.id === id)
    return a ? formatAddress(a) : `#${id}`
  }

  const productName = (id: number | string) =>
    products.find((p) => p.id === Number(id))?.nombre ?? t('orders.productFallback', { id })
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
      flash(t('admin.orders.created', { id: order.id, count: lines.length }))
    } catch {
      setError(t('admin.orders.createError'))
    }
  }

  // ---------- Editar pedido existente ----------
  function startEdit(order: Order) {
    setEditingId(order.id)
    setEditEstado(order.estado)
    setEditUsuario(String(order.usuario))
    setEditDireccion(order.direccion != null ? String(order.direccion) : '')
    setEditLine(emptyLine)
    setError(null)
    setSuccess(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLine(emptyLine)
  }

  async function saveOrderMeta(orderId: number) {
    if (!editUsuario || Number(editUsuario) < 1) {
      setError(t('admin.orders.invalidUser'))
      return
    }
    try {
      await updateOrder.mutateAsync({
        id: orderId,
        data: {
          estado: editEstado,
          usuario: Number(editUsuario),
          direccion: editDireccion === '' ? null : Number(editDireccion),
        },
      })
      flash(t('admin.orders.updated', { id: orderId }))
    } catch {
      setError(t('admin.orders.updateError'))
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
      flash(t('admin.orders.lineAdded', { id: orderId }))
    } catch {
      setError(t('admin.orders.addLineError'))
    }
  }

  async function removeLineFromOrder(detailId: number, orderId: number) {
    if (!confirm(t('admin.orders.confirmRemoveLine'))) return
    try {
      await deleteOrderDetail.mutateAsync(detailId)
      flash(t('admin.orders.lineRemoved', { id: orderId }))
    } catch {
      setError(t('admin.orders.removeLineError'))
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!confirm(t('admin.orders.confirmDeleteOrder'))) return
    try {
      await deleteOrder.mutateAsync(id)
      flash(t('admin.orders.deleted'))
    } catch {
      setError(t('admin.orders.deleteError'))
    }
  }

  return (
    <div>
      <h2>{t('admin.orders.title')}</h2>
      {(isError || error) && <p className="error">{error ?? t('admin.common.connError')}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">{t('admin.orders.hint')}</p>

      {/* Crear pedido y llenarlo en un solo formulario */}
      <form className="card form" onSubmit={handleCreate}>
        <h3>{t('admin.orders.newTitle')}</h3>
        <input
          type="number"
          min="1"
          placeholder={t('admin.orders.userIdPlaceholder')}
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value as OrderStatus)}>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>

        <div className="line-builder">
          <select
            value={lineDraft.producto}
            onChange={(e) => setLineDraft({ ...lineDraft, producto: e.target.value })}
          >
            <option value="">{t('admin.orders.selectProduct')}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — S/. {p.precio}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder={t('admin.orders.qtyShort')}
            value={lineDraft.cantidad}
            onChange={(e) => setLineDraft({ ...lineDraft, cantidad: e.target.value })}
          />
          <button type="button" onClick={addLineToDraft}>
            {t('admin.orders.addProduct')}
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
              <span>{t('admin.orders.estimatedTotal')}</span>
              <span>S/. {draftTotal.toFixed(2)}</span>
            </li>
          </ul>
        )}

        <div className="actions">
          <button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? t('admin.common.savingDots') : t('admin.orders.create')}
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>{t('admin.common.loadingDots')}</p>
      ) : orders.length === 0 ? (
        <p className="hint">{t('admin.orders.empty')}</p>
      ) : (
        <div className="cards-grid">
          {orders.map((order) => {
            const editing = editingId === order.id
            return (
              <div className="card" key={order.id}>
                <div className="row-actions">
                  <h3>
                    {t('admin.orders.orderLabel')} <span className="id-chip">#{order.id}</span>
                  </h3>
                  <div className="card-btns">
                    {editing ? (
                      <button onClick={cancelEdit}>{t('common.close')}</button>
                    ) : (
                      <button onClick={() => startEdit(order)}>{t('common.edit')}</button>
                    )}
                    <button onClick={() => handleDeleteOrder(order.id)} disabled={busy}>
                      {t('common.delete')}
                    </button>
                  </div>
                </div>

                <p className="order-meta">
                  {t('admin.orders.buyer')}:{' '}
                  <strong>{order.usuario_username ?? t('admin.orders.userFallback', { id: order.usuario })}</strong>{' '}
                  <span className="muted">{t('admin.orders.idTag', { id: order.usuario })}</span> ·{' '}
                  {new Date(order.fecha).toLocaleString()} ·{' '}
                  <span className={`status-badge status-${order.estado}`}>{t(`status.${order.estado}`)}</span>
                </p>
                <p className="order-address">
                  <strong>{t('admin.orders.shippingLabel')}</strong>
                  {order.direccion_detalle
                    ? formatAddress(order.direccion_detalle)
                    : addressLabel(order.direccion) ?? (
                        <span className="muted">{t('admin.orders.noShipping')}</span>
                      )}
                </p>
                <p>
                  <strong>{t('admin.orders.totalLabel', { total: Number(order.total).toFixed(2) })}</strong>
                </p>

                <strong>{t('admin.orders.detailsLabel')}</strong>
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
                  <p className="hint">{t('admin.orders.noProducts')}</p>
                )}

                {editing && (
                  <div className="order-editor">
                    <div className="edit-fields">
                      <label className="edit-field">
                        <span>{t('admin.orders.statusField')}</span>
                        <select
                          value={editEstado}
                          onChange={(e) => setEditEstado(e.target.value as OrderStatus)}
                        >
                          {ESTADOS.map((s) => (
                            <option key={s} value={s}>
                              {t(`status.${s}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="edit-field">
                        <span>{t('admin.orders.buyerField')}</span>
                        <input
                          type="number"
                          min="1"
                          value={editUsuario}
                          onChange={(e) => setEditUsuario(e.target.value)}
                        />
                      </label>
                      <label className="edit-field">
                        <span>{t('admin.orders.shippingField')}</span>
                        <select
                          value={editDireccion}
                          onChange={(e) => setEditDireccion(e.target.value)}
                        >
                          <option value="">{t('admin.orders.noAddressOption')}</option>
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              #{a.id} · {formatAddress(a)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button onClick={() => saveOrderMeta(order.id)} disabled={busy}>
                        {t('admin.common.saveChanges')}
                      </button>
                    </div>
                    <div className="line-builder">
                      <select
                        value={editLine.producto}
                        onChange={(e) => setEditLine({ ...editLine, producto: e.target.value })}
                      >
                        <option value="">{t('admin.orders.addProductOption')}</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} — S/. {p.precio}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder={t('admin.orders.qtyShort')}
                        value={editLine.cantidad}
                        onChange={(e) => setEditLine({ ...editLine, cantidad: e.target.value })}
                      />
                      <button onClick={() => addLineToOrder(order.id)} disabled={busy}>
                        {t('admin.orders.add')}
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
