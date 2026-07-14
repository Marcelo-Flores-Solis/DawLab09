import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
} from '../hooks/useAddresses'
import AddressLocationFields from '../components/AddressLocationFields'

interface AddressForm {
  usuario: string
  calle: string
  ciudad: string
  provincia: string
}

const emptyForm: AddressForm = { usuario: '', calle: '', ciudad: '', provincia: '' }

export default function AddressesPage() {
  const { data: addresses = [], isLoading, isError } = useAddresses()
  const createAddress = useCreateAddress()
  const deleteAddress = useDeleteAddress()

  const [form, setForm] = useState<AddressForm>(emptyForm)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      await createAddress.mutateAsync({ ...form, usuario: Number(form.usuario) })
      setForm(emptyForm)
      setSuccess('Dirección creada.')
    } catch {
      setError('Error al crear la dirección. Verifica el ID de usuario.')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta dirección?')) return
    await deleteAddress.mutateAsync(id)
    setSuccess('Dirección eliminada.')
  }

  return (
    <div>
      <h2>Direcciones</h2>
      {(isError || error) && <p className="error">{error ?? 'No se pudo conectar con la API.'}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">
        No hay endpoint de usuarios expuesto: usa el ID de un usuario existente (ver Django Admin en{' '}
        <code>/admin/</code>).
      </p>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Nueva dirección</h3>
        <input name="usuario" type="number" min="1" placeholder="ID de usuario" value={form.usuario} onChange={handleChange} required />
        <input name="calle" placeholder="Calle" value={form.calle} onChange={handleChange} required />
        <AddressLocationFields
          departamento={form.provincia}
          provincia={form.ciudad}
          onChange={({ departamento, provincia }) =>
            setForm({ ...form, provincia: departamento, ciudad: provincia })
          }
        />
        <div className="actions">
          <button type="submit" disabled={createAddress.isPending}>
            {createAddress.isPending ? 'Guardando...' : 'Crear dirección'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>Cargando...</p>
      ) : addresses.length === 0 ? (
        <p className="hint">Aún no hay direcciones. Crea una con el formulario de arriba.</p>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Calle</th>
              <th>Ciudad</th>
              <th>Provincia</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.usuario}</td>
                <td>{a.calle}</td>
                <td>{a.ciudad}</td>
                <td>{a.provincia}</td>
                <td>
                  <button onClick={() => handleDelete(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
