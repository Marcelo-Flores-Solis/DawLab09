import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import type { Product } from '../types'
import type { ProductPayload } from '../api/resources'

interface ProductForm {
  nombre: string
  descripcion: string
  precio: string
  stock: string
  categoria: string
  imagen: string
}

const emptyForm: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: '',
  imagen: '',
}

export default function ProductsPage() {
  const { data: products = [], isLoading, isError } = useProducts()
  const { data: categories = [] } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const saving = createProduct.isPending || updateProduct.isPending

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload: ProductPayload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: form.precio,
      stock: Number(form.stock),
      categoria: Number(form.categoria),
      imagen: form.imagen.trim(),
    }
    setError(null)
    setSuccess(null)
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, data: payload })
        setSuccess('Producto actualizado.')
      } else {
        await createProduct.mutateAsync(payload)
        setSuccess('Producto creado.')
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch {
      setError('Error al guardar el producto. Revisa los campos (precio > 0, stock >= 0).')
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: String(product.stock),
      categoria: String(product.categoria),
      imagen: product.imagen ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return
    await deleteProduct.mutateAsync(id)
    setSuccess('Producto eliminado.')
  }

  return (
    <div>
      <h2>Productos</h2>
      {(isError || error) && (
        <p className="error">
          {error ?? 'No se pudo conectar con la API. ¿Está corriendo el backend en :8000?'}
        </p>
      )}
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
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          name="imagen"
          type="url"
          placeholder="URL de la imagen (opcional): https://…"
          value={form.imagen}
          onChange={handleChange}
        />
        {form.imagen.trim() && (
          <img src={form.imagen.trim()} alt="Vista previa" className="img-preview" />
        )}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p>Cargando...</p>
      ) : products.length === 0 ? (
        <p className="hint">Aún no hay productos. Crea uno con el formulario de arriba.</p>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>ID</th>
              <th></th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className="cell-thumb" />
                  ) : (
                    <span className="cell-thumb cell-thumb--empty">—</span>
                  )}
                </td>
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
