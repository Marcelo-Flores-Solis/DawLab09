import { PERU, DEPARTAMENTOS } from '../data/peru'

// Dos desplegables encadenados (Departamento -> Provincia) con datos reales del
// Perú. En el modelo, la columna `provincia` guarda el departamento y `ciudad`
// la provincia, así que el padre expone ambos por su nombre geográfico.
interface Props {
  departamento: string
  provincia: string
  onChange: (next: { departamento: string; provincia: string }) => void
}

export default function AddressLocationFields({ departamento, provincia, onChange }: Props) {
  const provincias = departamento ? (PERU[departamento] ?? []) : []

  return (
    <>
      <select
        name="departamento"
        value={departamento}
        onChange={(e) => onChange({ departamento: e.target.value, provincia: '' })}
        required
      >
        <option value="">Departamento…</option>
        {DEPARTAMENTOS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        name="provincia"
        value={provincia}
        onChange={(e) => onChange({ departamento, provincia: e.target.value })}
        required
        disabled={!departamento}
      >
        <option value="">{departamento ? 'Provincia…' : 'Elige un departamento primero'}</option>
        {provincias.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </>
  )
}
