import { useEffect, useState } from 'react'
import { categoriesApi } from '../api/resources'

const emptyForm = { nombre: '', descripcion: '' }

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await categoriesApi.list()
      setCategories(data)
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
      await categoriesApi.create(form)
      setForm(emptyForm)
      setSuccess('Categoría creada.')
      await load()
    } catch (err) {
      setError('Error al crear la categoría (¿nombre duplicado?).')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta categoría? Se eliminarán sus productos asociados.')) return
    await categoriesApi.remove(id)
    setSuccess('Categoría eliminada.')
    load()
  }

  return (
    <div>
      <h2>Categorías</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Nueva categoría</h3>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        <div className="actions">
          <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear categoría'}</button>
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : categories.length === 0 ? (
        <p className="hint">Aún no hay categorías. Crea una con el formulario de arriba.</p>
      ) : (
        <div className="cards-grid">
          {categories.map((c) => (
            <div className="card" key={c.id}>
              <div className="row-actions">
                <h3>{c.nombre}</h3>
                <button onClick={() => handleDelete(c.id)}>Eliminar</button>
              </div>
              <p>{c.descripcion}</p>
              <strong>Productos ({c.productos?.length ?? 0})</strong>
              <ul>
                {c.productos?.map((p) => (
                  <li key={p.id}>{p.nombre} — S/. {p.precio} ({p.stock} en stock)</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
