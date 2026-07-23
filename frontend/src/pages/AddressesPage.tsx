import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      setSuccess(t('admin.addresses.created'))
    } catch {
      setError(t('admin.addresses.createError'))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t('admin.addresses.confirmDelete'))) return
    await deleteAddress.mutateAsync(id)
    setSuccess(t('admin.addresses.deleted'))
  }

  return (
    <div>
      <h2>{t('admin.addresses.title')}</h2>
      {(isError || error) && <p className="error">{error ?? t('admin.common.connError')}</p>}
      {success && <p className="success">{success}</p>}
      <p className="hint">{t('admin.addresses.hint')}</p>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>{t('admin.addresses.newTitle')}</h3>
        <input name="usuario" type="number" min="1" placeholder={t('admin.orders.userIdPlaceholder')} value={form.usuario} onChange={handleChange} required />
        <input name="calle" placeholder={t('admin.addresses.street')} value={form.calle} onChange={handleChange} required />
        <AddressLocationFields
          departamento={form.provincia}
          provincia={form.ciudad}
          onChange={({ departamento, provincia }) =>
            setForm({ ...form, provincia: departamento, ciudad: provincia })
          }
        />
        <div className="actions">
          <button type="submit" disabled={createAddress.isPending}>
            {createAddress.isPending ? t('admin.common.savingDots') : t('admin.addresses.create')}
          </button>
        </div>
      </form>

      {isLoading ? (
        <p>{t('admin.common.loadingDots')}</p>
      ) : addresses.length === 0 ? (
        <p className="hint">{t('admin.addresses.empty')}</p>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('admin.addresses.thUser')}</th>
              <th>{t('admin.addresses.thStreet')}</th>
              <th>{t('admin.addresses.thCity')}</th>
              <th>{t('admin.addresses.thProvince')}</th>
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
                  <button onClick={() => handleDelete(a.id)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
