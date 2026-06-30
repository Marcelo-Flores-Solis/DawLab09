import { useEffect, useState } from 'react'
import { addressesApi } from '../api/resources'

const emptyForm = { usuario: '', calle: '', ciudad: '', provincia: '' }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await addressesApi.list()
      setAddresses(data)
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await addressesApi.create({ ...form, usuario: Number(form.usuario) })
      setForm(emptyForm)
      setSuccess('Dirección creada.')
      await load()
    } catch (err) {
      setError('Error al crear la dirección. Verifica el ID de usuario.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta dirección?')) return
    await addressesApi.remove(id)
    setSuccess('Dirección eliminada.')
    load()
  }

  return (
    <div>
      <h2>Direcciones</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">
        No hay endpoint de usuarios expuesto: usa el ID de un usuario existente (ver Django Admin en <code>/admin/</code>).
      </p>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Nueva dirección</h3>
        <input name="usuario" type="number" min="1" placeholder="ID de usuario" value={form.usuario} onChange={handleChange} required />
        <input name="calle" placeholder="Calle" value={form.calle} onChange={handleChange} required />
        <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} required />
        <input name="provincia" placeholder="Provincia" value={form.provincia} onChange={handleChange} required />
        <div className="actions">
          <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear dirección'}</button>
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : addresses.length === 0 ? (
        <p className="hint">Aún no hay direcciones. Crea una con el formulario de arriba.</p>
      ) : (
        <table className="card">
          <thead>
            <tr><th>ID</th><th>Usuario</th><th>Calle</th><th>Ciudad</th><th>Provincia</th><th></th></tr>
          </thead>
          <tbody>
            {addresses.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.usuario}</td>
                <td>{a.calle}</td>
                <td>{a.ciudad}</td>
                <td>{a.provincia}</td>
                <td><button onClick={() => handleDelete(a.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
