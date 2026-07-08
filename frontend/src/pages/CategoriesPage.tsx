import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import type { CategoryPayload } from '../api/resources'

const emptyForm: CategoryPayload = { nombre: '', descripcion: '' }

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const [form, setForm] = useState<CategoryPayload>(emptyForm)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      await createCategory.mutateAsync(form)
      setForm(emptyForm)
      setSuccess('Categoría creada.')
    } catch {
      setError('Error al crear la categoría (¿nombre duplicado?).')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta categoría? Se eliminarán sus productos asociados.')) return
    await deleteCategory.mutateAsync(id)
    setSuccess('Categoría eliminada.')
  }

  return (
    <div>
      <h2>Categorías</h2>
      {(isError || error) && <p className="error">{error ?? 'No se pudo conectar con la API.'}</p>}
      {success && <p className="success">{success}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Nueva categoría</h3>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
        <div className="actions">
          <button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? 'Guardando...' : 'Crear categoría'}
          </button>
        </div>
      </form>

      {isLoading ? (
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
                  <li key={p.id}>
                    {p.nombre} — S/. {p.precio} ({p.stock} en stock)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
