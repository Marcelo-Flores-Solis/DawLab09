import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import { isAuthenticated } from '../api/auth'
import { useCheckout } from '../hooks/useCheckout'
import { useProducts } from '../hooks/useProducts'
import { useAddresses, useCreateAddress } from '../hooks/useAddresses'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import ProductThumb from '../components/ProductThumb'
import AddressLocationFields from '../components/AddressLocationFields'
import PersonalDataFields from '../components/PersonalDataFields'
import {
  emptyPersonalData,
  personalDataErrors,
  type PersonalDataForm,
} from '../lib/personalData'
import type { Product, Profile } from '../types'

function contactFromProfile(p?: Profile): PersonalDataForm {
  if (!p) return emptyPersonalData
  return {
    dni: p.dni ?? '',
    nombres: p.nombres ?? '',
    apellidos: p.apellidos ?? '',
    telefono: p.telefono ?? '',
    correo: p.correo ?? '',
    fecha_nacimiento: p.fecha_nacimiento ?? '',
  }
}

const emptyAddress = { calle: '', ciudad: '', provincia: '' }

export default function CartPage() {
  const { items, setQty, removeItem, clear, total, syncWith } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const { mutate: checkout, isPending: placing } = useCheckout()

  const authed = isAuthenticated()
  const { data: products = [], refetch: refetchProducts } = useProducts()
  const { data: addresses = [] } = useAddresses()
  const createAddress = useCreateAddress()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const [selected, setSelected] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newAddr, setNewAddr] = useState(emptyAddress)
  const [contact, setContact] = useState<PersonalDataForm>(emptyPersonalData)
  const [contactLoaded, setContactLoaded] = useState(false)

  // Preselecciona la primera dirección guardada cuando cargan.
  useEffect(() => {
    if (selected == null && addresses.length > 0) setSelected(addresses[0].id)
  }, [addresses, selected])

  // Autocompleta los datos de contacto desde el perfil (una vez cargado).
  useEffect(() => {
    if (!contactLoaded && profile) {
      setContact(contactFromProfile(profile))
      setContactLoaded(true)
    }
  }, [profile, contactLoaded])

  function fillFromProfile() {
    setContact(contactFromProfile(profile))
    notify('Datos traídos de tu perfil')
  }

  // Detecta líneas con precio/stock desactualizado respecto al backend, o
  // productos que ya no existen. Mientras las haya, bloqueamos la compra.
  const productById = useMemo(() => {
    const map = new Map<number, Product>()
    products.forEach((p) => map.set(p.id, p))
    return map
  }, [products])

  const staleItems = useMemo(
    () =>
      items.filter((it) => {
        const p = productById.get(it.id)
        if (!p) return true // el producto ya no existe
        return p.precio !== it.precio || p.stock < it.cantidad
      }),
    [items, productById]
  )
  const hasStale = products.length > 0 && staleItems.length > 0

  function handleSync() {
    syncWith(products)
    notify('Actualizamos precios y stock de tu carrito')
  }

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

  async function handleCheckout() {
    // Gate de compra: navegar es libre, pero para confirmar el pedido
    // hace falta iniciar sesión. Volvemos al carrito tras autenticarse.
    if (!authed) {
      notify('Inicia sesión para completar tu compra', 'error')
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    if (hasStale) {
      notify('Tu carrito tiene precios desactualizados. Actualízalo antes de comprar.', 'error')
      return
    }
    const contactErr = personalDataErrors(contact, { require: true })
    if (contactErr) {
      notify(contactErr, 'error')
      return
    }
    if (selected == null) {
      notify('Elige o añade una dirección de envío', 'error')
      return
    }
    // Guardamos (y revalidamos en el servidor) los datos de contacto en el
    // perfil antes de crear el pedido.
    try {
      await updateProfile.mutateAsync({
        dni: contact.dni,
        nombres: contact.nombres,
        apellidos: contact.apellidos,
        telefono: contact.telefono,
      })
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Revisa tus datos de contacto', 'error')
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
        // Ante un error (p. ej. precio cambiado 409 o stock insuficiente),
        // refrescamos los productos para que el aviso del carrito se actualice.
        onError: (err) => {
          void refetchProducts()
          notify(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.',
            'error'
          )
        },
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

  const needsAddress = authed && selected == null
  const showNewForm = authed && (showNew || addresses.length === 0)
  const contactBad = authed && personalDataErrors(contact, { require: true }) !== null
  const busy = placing || updateProfile.isPending

  return (
    <div className="cart-page">
      <h1 className="page-title">Tu carrito</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {hasStale && (
            <div className="cart-warning">
              <div>
                <strong>Algunos productos cambiaron</strong>
                <p className="muted">
                  El precio o el stock se actualizaron desde que los agregaste. Revisa tu
                  carrito antes de confirmar.
                </p>
              </div>
              <button className="add-btn" onClick={handleSync}>
                Actualizar carrito
              </button>
            </div>
          )}

          {items.map((item) => {
            const current = productById.get(item.id)
            const priceChanged = current != null && current.precio !== item.precio
            return (
              <div className="cart-item" key={item.id}>
                <ProductThumb id={item.id} size="mini" imageUrl={item.imagen} />
                <div className="cart-item-info">
                  <h3>{item.nombre}</h3>
                  <span className="product-price">
                    S/ {Number(item.precio).toFixed(2)}
                    {priceChanged && (
                      <span className="price-changed"> → S/ {Number(current!.precio).toFixed(2)}</span>
                    )}
                  </span>
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
            )
          })}
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
            <div className="checkout-contact">
              <div className="checkout-contact-head">
                <h3>Datos de contacto</h3>
                {profile && (profile.dni || profile.nombres) && (
                  <button type="button" className="link-btn" onClick={fillFromProfile}>
                    Traer de mi perfil
                  </button>
                )}
              </div>
              <div className="form contact-fields">
                <PersonalDataFields
                  value={contact}
                  onChange={(patch) => setContact({ ...contact, ...patch })}
                />
              </div>
            </div>
          )}

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
                  <AddressLocationFields
                    departamento={newAddr.provincia}
                    provincia={newAddr.ciudad}
                    onChange={({ departamento, provincia }) =>
                      setNewAddr({ ...newAddr, provincia: departamento, ciudad: provincia })
                    }
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
            disabled={busy || hasStale || contactBad || needsAddress}
          >
            {busy
              ? 'Procesando…'
              : !authed
                ? 'Iniciar sesión para comprar'
                : hasStale
                  ? 'Actualiza tu carrito'
                  : contactBad
                    ? 'Completa tus datos'
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
