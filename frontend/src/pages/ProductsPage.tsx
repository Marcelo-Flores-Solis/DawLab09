import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
        setSuccess(t('admin.products.updated'))
      } else {
        await createProduct.mutateAsync(payload)
        setSuccess(t('admin.products.created'))
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch {
      setError(t('admin.products.saveError'))
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
    if (!confirm(t('admin.products.confirmDelete'))) return
    await deleteProduct.mutateAsync(id)
    setSuccess(t('admin.products.deleted'))
  }

  return (
    <div>
      <h2>{t('admin.products.title')}</h2>
      {(isError || error) && <p className="error">{error ?? t('admin.products.connError')}</p>}
      {success && <p className="success">{success}</p>}

      <form className="card form" onSubmit={handleSubmit}>
        <h3>{editingId ? t('admin.products.editTitle') : t('admin.products.newTitle')}</h3>
        <input name="nombre" placeholder={t('admin.common.name')} value={form.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder={t('admin.common.description')} value={form.descripcion} onChange={handleChange} required />
        <input name="precio" type="number" step="0.01" min="0.01" placeholder={t('admin.products.price')} value={form.precio} onChange={handleChange} required />
        <input name="stock" type="number" min="0" placeholder={t('admin.products.stock')} value={form.stock} onChange={handleChange} required />
        <select name="categoria" value={form.categoria} onChange={handleChange} required>
          <option value="">{t('admin.products.selectCategory')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          name="imagen"
          type="url"
          placeholder={t('admin.products.imageUrl')}
          value={form.imagen}
          onChange={handleChange}
        />
        {form.imagen.trim() && (
          <img src={form.imagen.trim()} alt={t('admin.products.preview')} className="img-preview" />
        )}
        <div className="actions">
          <button type="submit" disabled={saving}>
            {saving ? t('admin.common.savingDots') : editingId ? t('admin.common.saveChanges') : t('admin.products.create')}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={saving}>
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p>{t('admin.common.loadingDots')}</p>
      ) : products.length === 0 ? (
        <p className="hint">{t('admin.products.empty')}</p>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>ID</th>
              <th></th>
              <th>{t('admin.common.name')}</th>
              <th>{t('admin.products.price')}</th>
              <th>{t('admin.products.stock')}</th>
              <th>{t('admin.products.thCategory')}</th>
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
                  <button onClick={() => startEdit(p)}>{t('common.edit')}</button>
                  <button onClick={() => handleDelete(p.id)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
