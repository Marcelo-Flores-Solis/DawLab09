import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { useAddresses, useCreateAddress, useDeleteAddress } from '../hooks/useAddresses'
import { useToast } from '../hooks/useToast'
import PersonalDataFields from '../components/PersonalDataFields'
import {
  emptyPersonalData,
  personalDataErrors,
  type PersonalDataForm,
} from '../lib/personalData'
import AddressLocationFields from '../components/AddressLocationFields'
import type { Profile } from '../types'

function toForm(p?: Profile): PersonalDataForm {
  if (!p) return emptyPersonalData
  return {
    dni: p.dni ?? '',
    nombres: p.nombres ?? '',
    apellidos: p.apellidos ?? '',
    telefono: p.telefono ?? '',
    correo: p.correo ?? '',
    fecha_nacimiento: p.fecha_nacimiento ?? '',
  }
}

// ¿El perfil tiene algún dato que valga la pena mostrar? El backend crea el
// perfil vacío en el primer acceso, así que distinguimos "vacío" de "completo".
function hasPersonalData(p?: Profile): boolean {
  if (!p) return false
  return Boolean(p.dni || p.nombres || p.apellidos || p.telefono || p.correo || p.fecha_nacimiento)
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const [y, m, d] = value.split('-')
  return d && m && y ? `${d}/${m}/${y}` : value
}

const emptyAddress = { calle: '', ciudad: '', provincia: '' }

export default function ProfilePage() {
  const { t } = useTranslation()
  const { notify } = useToast()

  // --- Datos personales ---
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const [personal, setPersonal] = useState<PersonalDataForm>(emptyPersonalData)
  const [loaded, setLoaded] = useState(false)
  // El formulario está oculto por defecto: sólo se muestra al editar.
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!loaded && profile) {
      setPersonal(toForm(profile))
      setLoaded(true)
    }
  }, [profile, loaded])

  function startEditing() {
    // Rellenamos el formulario con lo que hay guardado antes de abrirlo.
    setPersonal(toForm(profile))
    setEditing(true)
  }

  function cancelEditing() {
    setPersonal(toForm(profile))
    setEditing(false)
  }

  async function savePersonal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const error = personalDataErrors(personal)
    if (error) {
      notify(error, 'error')
      return
    }
    try {
      await updateProfile.mutateAsync({
        dni: personal.dni,
        nombres: personal.nombres,
        apellidos: personal.apellidos,
        telefono: personal.telefono,
        correo: personal.correo,
        fecha_nacimiento: personal.fecha_nacimiento || null,
      })
      notify(t('toast.profileSaved'))
      // Guardado con éxito: cerramos el formulario y volvemos a la vista estática.
      setEditing(false)
    } catch (err) {
      notify(err instanceof Error ? err.message : t('toast.profileSaveError'), 'error')
    }
  }

  const hasData = hasPersonalData(profile)

  // --- Direcciones ---
  const { data: addresses = [], isLoading, isError } = useAddresses()
  const createAddress = useCreateAddress()
  const deleteAddress = useDeleteAddress()
  const [addr, setAddr] = useState(emptyAddress)

  async function saveAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await createAddress.mutateAsync(addr)
      setAddr(emptyAddress)
      notify(t('toast.addressSaved'))
    } catch {
      notify(t('toast.addressSaveError'), 'error')
    }
  }

  async function removeAddress(id: number) {
    if (!confirm(t('profile.confirmDeleteAddress'))) return
    try {
      await deleteAddress.mutateAsync(id)
      notify(t('toast.addressDeleted'))
    } catch {
      notify(t('toast.addressDeleteError'), 'error')
    }
  }

  function handleAddrCalle(e: ChangeEvent<HTMLInputElement>) {
    setAddr({ ...addr, calle: e.target.value })
  }

  return (
    <div className="profile-page page-pad">
      <h1 className="page-title">{t('profile.title')}</h1>

      <section className="profile-section">
        <div className="profile-section-head">
          <h2>{t('profile.personalTitle')}</h2>
          {!editing && hasData && (
            <button className="ghost-btn" type="button" onClick={startEditing}>
              {t('common.edit')}
            </button>
          )}
        </div>
        <p className="muted">{t('profile.personalHint')}</p>

        {editing ? (
          <form className="form profile-form" onSubmit={savePersonal}>
            <PersonalDataFields
              value={personal}
              onChange={(patch) => setPersonal({ ...personal, ...patch })}
              full
            />
            <div className="profile-form-actions">
              <button className="add-btn" type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? t('common.saving') : t('profile.saveData')}
              </button>
              {hasData && (
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={cancelEditing}
                  disabled={updateProfile.isPending}
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </form>
        ) : hasData ? (
          <dl className="profile-card">
            <div className="profile-field">
              <dt>{t('profile.fields.nombres')}</dt>
              <dd>{profile?.nombres || '—'}</dd>
            </div>
            <div className="profile-field">
              <dt>{t('profile.fields.apellidos')}</dt>
              <dd>{profile?.apellidos || '—'}</dd>
            </div>
            <div className="profile-field">
              <dt>{t('profile.fields.dni')}</dt>
              <dd>{profile?.dni || '—'}</dd>
            </div>
            <div className="profile-field">
              <dt>{t('profile.fields.telefono')}</dt>
              <dd>{profile?.telefono || '—'}</dd>
            </div>
            <div className="profile-field">
              <dt>{t('profile.fields.correo')}</dt>
              <dd>{profile?.correo || '—'}</dd>
            </div>
            <div className="profile-field">
              <dt>{t('profile.fields.fechaNacimiento')}</dt>
              <dd>{formatDate(profile?.fecha_nacimiento ?? null)}</dd>
            </div>
          </dl>
        ) : (
          <div className="profile-empty">
            <p className="muted">{t('profile.emptyText')}</p>
            <button className="add-btn" type="button" onClick={startEditing}>
              {t('profile.completeBtn')}
            </button>
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2>{t('profile.addressesTitle')}</h2>
        <p className="muted">{t('profile.addressesHint')}</p>

        <form className="form address-form" onSubmit={saveAddress}>
          <input
            name="calle"
            placeholder={t('cart.streetPlaceholder')}
            value={addr.calle}
            onChange={handleAddrCalle}
            required
          />
          <AddressLocationFields
            departamento={addr.provincia}
            provincia={addr.ciudad}
            onChange={({ departamento, provincia }) =>
              setAddr({ ...addr, provincia: departamento, ciudad: provincia })
            }
          />
          <button className="add-btn" type="submit" disabled={createAddress.isPending}>
            {createAddress.isPending ? t('common.saving') : t('profile.saveAddress')}
          </button>
        </form>

        {isError && <p className="error">{t('profile.addressesError')}</p>}

        {isLoading ? (
          <p className="muted">{t('common.loading')}</p>
        ) : addresses.length === 0 ? (
          <p className="muted">{t('profile.noAddresses')}</p>
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
                  onClick={() => removeAddress(a.id)}
                  aria-label={t('profile.deleteAddressAria')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/" className="continue-link">
        {t('common.continueShopping')}
      </Link>
    </div>
  )
}
