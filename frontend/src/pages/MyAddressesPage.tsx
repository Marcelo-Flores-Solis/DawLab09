import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
} from '../hooks/useAddresses'
import { useToast } from '../hooks/useToast'

interface AddressForm {
  calle: string
  ciudad: string
  provincia: string
}

const emptyForm: AddressForm = { calle: '', ciudad: '', provincia: '' }

// Autogestión de direcciones del cliente: crear, listar y eliminar las suyas.
// No pide el ID de usuario (el backend lo toma del token).
export default function MyAddressesPage() {
  const { data: addresses = [], isLoading, isError } = useAddresses()
  const createAddress = useCreateAddress()
  const deleteAddress = useDeleteAddress()
  const { notify } = useToast()

  const [form, setForm] = useState<AddressForm>(emptyForm)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await createAddress.mutateAsync(form)
      setForm(emptyForm)
      notify('Dirección guardada')
    } catch {
      notify('No se pudo guardar la dirección', 'error')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta dirección?')) return
    try {
      await deleteAddress.mutateAsync(id)
      notify('Dirección eliminada')
    } catch {
      notify('No se pudo eliminar la dirección', 'error')
    }
  }

  return (
    <div className="addresses-page page-pad">
      <h1 className="page-title">Mis direcciones</h1>
      <p className="muted">Guárdalas una vez y reutilízalas al confirmar tus compras.</p>

      <form className="form address-form" onSubmit={handleSubmit}>
        <h3>Nueva dirección</h3>
        <input
          name="calle"
          placeholder="Calle y número"
          value={form.calle}
          onChange={handleChange}
          required
        />
        <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} required />
        <input
          name="provincia"
          placeholder="Provincia"
          value={form.provincia}
          onChange={handleChange}
          required
        />
        <button className="add-btn" type="submit" disabled={createAddress.isPending}>
          {createAddress.isPending ? 'Guardando…' : 'Guardar dirección'}
        </button>
      </form>

      {isError && <p className="error">No se pudieron cargar tus direcciones.</p>}

      {isLoading ? (
        <p className="muted">Cargando…</p>
      ) : addresses.length === 0 ? (
        <p className="muted">Aún no tienes direcciones guardadas.</p>
      ) : (
        <ul className="address-list">
          {addresses.map((a) => (
            <li className="address-card" key={a.id}>
              <div className="address-card-info">
                <strong>{a.calle}</strong>
                <span className="muted">
                  {a.ciudad}, {a.provincia}
                </span>
              </div>
              <button
                className="remove-btn"
                onClick={() => handleDelete(a.id)}
                aria-label="Eliminar dirección"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link to="/" className="continue-link">
        ← Seguir comprando
      </Link>
    </div>
  )
}
