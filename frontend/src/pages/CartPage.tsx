import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    notify(t('toast.dataFromProfile'))
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
    notify(t('toast.cartSynced'))
  }

  async function handleAddAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const created = await createAddress.mutateAsync(newAddr)
      setSelected(created.id)
      setNewAddr(emptyAddress)
      setShowNew(false)
      notify(t('toast.addressSaved'))
    } catch {
      notify(t('toast.addressSaveError'), 'error')
    }
  }

  async function handleCheckout() {
    // Gate de compra: navegar es libre, pero para confirmar el pedido
    // hace falta iniciar sesión. Volvemos al carrito tras autenticarse.
    if (!authed) {
      notify(t('toast.loginToCheckout'), 'error')
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    if (hasStale) {
      notify(t('toast.staleCheckout'), 'error')
      return
    }
    const contactErr = personalDataErrors(contact, { require: true })
    if (contactErr) {
      notify(contactErr, 'error')
      return
    }
    if (selected == null) {
      notify(t('toast.chooseAddress'), 'error')
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
      notify(err instanceof Error ? err.message : t('toast.checkContact'), 'error')
      return
    }
    checkout(
      { items, direccion: selected },
      {
        onSuccess: (order) => {
          clear()
          notify(t('toast.orderPlaced', { id: order.id }))
          navigate('/mis-pedidos')
        },
        // Ante un error (p. ej. precio cambiado 409 o stock insuficiente),
        // refrescamos los productos para que el aviso del carrito se actualice.
        onError: (err) => {
          void refetchProducts()
          notify(err instanceof Error ? err.message : t('toast.orderError'), 'error')
        },
      }
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty-icon">🛒</span>
        <h2>{t('cart.emptyTitle')}</h2>
        <p className="muted">{t('cart.emptyText')}</p>
        <Link to="/" className="add-btn cart-empty-cta">
          {t('common.goToStore')}
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
      <h1 className="page-title">{t('cart.title')}</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {hasStale && (
            <div className="cart-warning">
              <div>
                <strong>{t('cart.staleTitle')}</strong>
                <p className="muted">{t('cart.staleText')}</p>
              </div>
              <button className="add-btn" onClick={handleSync}>
                {t('cart.syncBtn')}
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
                  <button onClick={() => setQty(item.id, item.cantidad - 1)} aria-label={t('cart.decrease')}>
                    −
                  </button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => setQty(item.id, item.cantidad + 1)} aria-label={t('cart.increase')}>
                    +
                  </button>
                </div>

                <span className="cart-item-subtotal">
                  S/ {(Number(item.precio) * item.cantidad).toFixed(2)}
                </span>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                  aria-label={t('cart.remove')}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>

        <aside className="cart-summary">
          <h2>{t('cart.summary')}</h2>
          <div className="summary-row">
            <span>{t('cart.products')}</span>
            <span>{items.reduce((n, p) => n + p.cantidad, 0)}</span>
          </div>
          <div className="summary-row">
            <span>{t('cart.subtotal')}</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>{t('cart.total')}</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>

          {authed && (
            <div className="checkout-contact">
              <div className="checkout-contact-head">
                <h3>{t('cart.contactTitle')}</h3>
                {profile && (profile.dni || profile.nombres) && (
                  <button type="button" className="link-btn" onClick={fillFromProfile}>
                    {t('cart.fillFromProfile')}
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
              <h3>{t('cart.shippingTitle')}</h3>

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
                    {t('cart.addAnother')}
                  </button>
                </>
              )}

              {showNewForm && (
                <form className="form address-inline" onSubmit={handleAddAddress}>
                  <input
                    placeholder={t('cart.streetPlaceholder')}
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
                      {createAddress.isPending ? t('common.saving') : t('cart.saveAddress')}
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" className="ghost-btn" onClick={() => setShowNew(false)}>
                        {t('common.cancel')}
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
              ? t('cart.processing')
              : !authed
                ? t('cart.loginToBuy')
                : hasStale
                  ? t('cart.updateCart')
                  : contactBad
                    ? t('cart.completeData')
                    : needsAddress
                      ? t('cart.addAddressCta')
                      : t('cart.confirm')}
          </button>
          <Link to="/" className="continue-link">
            {t('common.continueShopping')}
          </Link>
        </aside>
      </div>
    </div>
  )
}
