import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import { isAuthenticated } from '../api/auth'
import { useCheckout } from '../hooks/useCheckout'
import { useAddresses, useCreateAddress } from '../hooks/useAddresses'
import ProductThumb from '../components/ProductThumb'

const emptyAddress = { calle: '', ciudad: '', provincia: '' }

export default function CartPage() {
  const { items, setQty, removeItem, clear, total } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { mutate: checkout, isPending: placing } = useCheckout()

  const authed = isAuthenticated()
  const { data: addresses = [] } = useAddresses()
  const createAddress = useCreateAddress()

  const [selected, setSelected] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newAddr, setNewAddr] = useState(emptyAddress)

  // Preselecciona la primera dirección guardada cuando cargan.
  useEffect(() => {
    if (selected == null && addresses.length > 0) setSelected(addresses[0].id)
  }, [addresses, selected])

  async function handleAddAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const created = await createAddress.mutateAsync(newAddr)
      setSelected(created.id)
      setNewAddr(emptyAddress)
      setShowNew(false)
      notify('Dirección guardada')
    } catch {
      notify('No se pudo guardar la dirección', 'error')
    }
  }

  function handleCheckout() {
    // Gate de compra: navegar es libre, pero para confirmar el pedido
    // hace falta iniciar sesión. Volvemos al carrito tras autenticarse.
    if (!authed) {
      notify('Inicia sesión para completar tu compra', 'error')
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    if (selected == null) {
      notify('Elige o añade una dirección de envío', 'error')
      return
    }
    checkout(
      { items, direccion: selected },
      {
        onSuccess: (order) => {
          clear()
          notify(`Pedido #${order.id} realizado con éxito`)
          navigate('/mis-pedidos')
        },
        // El backend devuelve el motivo (p. ej. stock insuficiente); lo mostramos.
        onError: (err) =>
          notify(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.',
            'error'
          ),
      }
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Explora la tienda y agrega productos para realizar tu pedido.</p>
        <Link to="/" className="add-btn cart-empty-cta">
          Ir a la tienda
        </Link>
      </div>
    )
  }

  // Con sesión iniciada exigimos una dirección de envío (guardada o nueva).
  const needsAddress = authed && selected == null
  const showNewForm = authed && (showNew || addresses.length === 0)

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
                <button onClick={() => setQty(item.id, item.cantidad - 1)} aria-label="Restar">
                  −
                </button>
                <span>{item.cantidad}</span>
                <button onClick={() => setQty(item.id, item.cantidad + 1)} aria-label="Sumar">
                  +
                </button>
              </div>

              <span className="cart-item-subtotal">
                S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
              </span>

              <button
                className="remove-btn"
                onClick={() => removeItem(item.id)}
                aria-label="Quitar"
              >
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

          {authed && (
            <div className="checkout-address">
              <h3>Dirección de envío</h3>

              {addresses.length > 0 && !showNew && (
                <>
                  <ul className="address-choices">
                    {addresses.map((a) => (
                      <li key={a.id}>
                        <label className={`address-choice ${selected === a.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="shipping-address"
                            checked={selected === a.id}
                            onChange={() => setSelected(a.id)}
                          />
                          <span className="address-choice-text">
                            <strong>{a.calle}</strong>
                            <span className="muted">
                              {a.ciudad}, {a.provincia}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="link-btn" onClick={() => setShowNew(true)}>
                    ＋ Añadir otra dirección
                  </button>
                </>
              )}

              {showNewForm && (
                <form className="form address-inline" onSubmit={handleAddAddress}>
                  <input
                    placeholder="Calle y número"
                    value={newAddr.calle}
                    onChange={(e) => setNewAddr({ ...newAddr, calle: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Ciudad"
                    value={newAddr.ciudad}
                    onChange={(e) => setNewAddr({ ...newAddr, ciudad: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Provincia"
                    value={newAddr.provincia}
                    onChange={(e) => setNewAddr({ ...newAddr, provincia: e.target.value })}
                    required
                  />
                  <div className="inline-actions">
                    <button type="submit" className="add-btn" disabled={createAddress.isPending}>
                      {createAddress.isPending ? 'Guardando…' : 'Guardar dirección'}
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" className="ghost-btn" onClick={() => setShowNew(false)}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          <button
            className="add-btn checkout-btn"
            onClick={handleCheckout}
            disabled={placing || needsAddress}
          >
            {placing
              ? 'Procesando…'
              : !authed
                ? 'Iniciar sesión para comprar'
                : needsAddress
                  ? 'Añade una dirección'
                  : 'Confirmar pedido'}
          </button>
          <Link to="/" className="continue-link">
            ← Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}
