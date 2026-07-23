import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import type { CategoryPayload } from '../api/resources'

const emptyForm: CategoryPayload = { nombre: '', descripcion: '' }

export default function CategoriesPage() {
  const { t } = useTranslation()
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
      setSuccess(t('admin.categories.created'))
    } catch {
      setError(t('admin.categories.createError'))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('admin.categories.confirmDelete'))) return
    await deleteCategory.mutateAsync(id)
    setSuccess(t('admin.categories.deleted'))
  }

  return (
    <div>
      <h2>{t('admin.categories.title')}</h2>
      {(isError || error) && <p className="error">{error ?? t('admin.common.connError')}</p>}
      {success && <p className="success">{success}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>{t('admin.categories.newTitle')}</h3>
        <input name="nombre" placeholder={t('admin.common.name')} value={form.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder={t('admin.common.description')} value={form.descripcion} onChange={handleChange} required />
        <div className="actions">
          <button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? t('admin.common.savingDots') : t('admin.categories.create')}
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>{t('admin.common.loadingDots')}</p>
      ) : categories.length === 0 ? (
        <p className="hint">{t('admin.categories.empty')}</p>
      ) : (
        <div className="cards-grid">
          {categories.map((c) => (
            <div className="card" key={c.id}>
              <div className="row-actions">
                <h3>{c.nombre}</h3>
                <button onClick={() => handleDelete(c.id)}>{t('common.delete')}</button>
              </div>
              <p>{c.descripcion}</p>
              <strong>{t('admin.categories.productsCount', { count: c.productos?.length ?? 0 })}</strong>
              <ul>
                {c.productos?.map((p) => (
                  <li key={p.id}>
                    {t('admin.categories.productLine', { name: p.nombre, price: p.precio, stock: p.stock })}
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
