import { useTranslation } from 'react-i18next'
import type { PersonalDataForm } from '../lib/personalData'

// Campos de datos personales reutilizables (perfil y checkout), con validación
// de formato. `full` añade correo y fecha de nacimiento (sólo en el perfil).
interface Props {
  value: PersonalDataForm
  onChange: (patch: Partial<PersonalDataForm>) => void
  full?: boolean
}

export default function PersonalDataFields({ value, onChange, full = false }: Props) {
  const { t } = useTranslation()
  return (
    <>
      <input
        name="dni"
        inputMode="numeric"
        maxLength={8}
        pattern="\d{8}"
        title={t('personal.digits8')}
        placeholder={t('personal.dniPlaceholder')}
        value={value.dni}
        onChange={(e) => onChange({ dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
      />
      <input
        name="nombres"
        placeholder={t('personal.nombres')}
        value={value.nombres}
        onChange={(e) => onChange({ nombres: e.target.value })}
      />
      <input
        name="apellidos"
        placeholder={t('personal.apellidos')}
        value={value.apellidos}
        onChange={(e) => onChange({ apellidos: e.target.value })}
      />
      <input
        name="telefono"
        inputMode="numeric"
        maxLength={9}
        pattern="\d{9}"
        title={t('personal.digits9')}
        placeholder={t('personal.telefonoPlaceholder')}
        value={value.telefono}
        onChange={(e) => onChange({ telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
      />
      {full && (
        <>
          <input
            name="correo"
            type="email"
            placeholder={t('personal.correoPlaceholder')}
            value={value.correo}
            onChange={(e) => onChange({ correo: e.target.value })}
          />
          <label className="date-field">
            <span className="muted">{t('personal.fechaNacimiento')}</span>
            <input
              name="fecha_nacimiento"
              type="date"
              value={value.fecha_nacimiento}
              onChange={(e) => onChange({ fecha_nacimiento: e.target.value })}
            />
          </label>
        </>
      )}
    </>
  )
}
