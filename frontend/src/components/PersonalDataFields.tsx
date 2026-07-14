import type { PersonalDataForm } from '../lib/personalData'

// Campos de datos personales reutilizables (perfil y checkout), con validación
// de formato. `full` añade correo y fecha de nacimiento (sólo en el perfil).
interface Props {
  value: PersonalDataForm
  onChange: (patch: Partial<PersonalDataForm>) => void
  full?: boolean
}

export default function PersonalDataFields({ value, onChange, full = false }: Props) {
  return (
    <>
      <input
        name="dni"
        inputMode="numeric"
        maxLength={8}
        pattern="\d{8}"
        title="8 dígitos"
        placeholder="DNI (8 dígitos)"
        value={value.dni}
        onChange={(e) => onChange({ dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
      />
      <input
        name="nombres"
        placeholder="Nombres"
        value={value.nombres}
        onChange={(e) => onChange({ nombres: e.target.value })}
      />
      <input
        name="apellidos"
        placeholder="Apellidos"
        value={value.apellidos}
        onChange={(e) => onChange({ apellidos: e.target.value })}
      />
      <input
        name="telefono"
        inputMode="numeric"
        maxLength={9}
        pattern="\d{9}"
        title="9 dígitos"
        placeholder="Teléfono (9 dígitos)"
        value={value.telefono}
        onChange={(e) => onChange({ telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
      />
      {full && (
        <>
          <input
            name="correo"
            type="email"
            placeholder="Correo electrónico"
            value={value.correo}
            onChange={(e) => onChange({ correo: e.target.value })}
          />
          <label className="date-field">
            <span className="muted">Fecha de nacimiento</span>
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
