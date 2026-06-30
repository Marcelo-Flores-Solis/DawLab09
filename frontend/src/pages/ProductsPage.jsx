import { useEffect, useState } from 'react'
import { categoriesApi, productsApi } from '../api/resources'

const emptyForm = { nombre: '', descripcion: '', precio: '', stock: '', categoria: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setError(null)
    } catch (err) {
      setError('No se pudo conectar con la API. ¿Está corriendo el backend en :8000?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      stock: Number(form.stock),
      categoria: Number(form.categoria),
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await productsApi.update(editingId, payload)
        setSuccess('Producto actualizado.')
      } else {
        await productsApi.create(payload)
        setSuccess('Producto creado.')
      }
      setForm(emptyForm)
      setEditingId(null)
      await loadAll()
    } catch (err) {
      setError('Error al guardar el producto. Revisa los campos (precio > 0, stock >= 0).')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(product) {
    setEditingId(product.id)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoria: product.categoria,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await productsApi.remove(id)
    setSuccess('Producto eliminado.')
    loadAll()
  }

  return (
    <div>
      <h2>Productos</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Editar producto' : 'Nuevo producto'}</h3>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        <input name="precio" type="number" step="0.01" min="0.01" placeholder="Precio" value={form.precio} onChange={handleChange} required />
        <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <select name="categoria" value={form.categoria} onChange={handleChange} required>
          <option value="">Selecciona categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editingId && <button type="button" onClick={cancelEdit} disabled={saving}>Cancelar</button>}
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : products.length === 0 ? (
        <p className="hint">Aún no hay productos. Crea uno con el formulario de arriba.</p>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Categoría</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>S/. {p.precio}</td>
                <td>{p.stock}</td>
                <td>{categories.find((c) => c.id === p.categoria)?.nombre ?? p.categoria}</td>
                <td className="row-actions">
                  <button onClick={() => startEdit(p)}>Editar</button>
                  <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
