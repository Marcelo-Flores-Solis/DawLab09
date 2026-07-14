// Tipo, valor inicial y validación de los datos personales. Vive fuera del
// componente para no romper el fast-refresh (un .tsx sólo debe exportar
// componentes).

export interface PersonalDataForm {
  dni: string
  nombres: string
  apellidos: string
  telefono: string
  correo: string
  fecha_nacimiento: string
}

export const emptyPersonalData: PersonalDataForm = {
  dni: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  correo: '',
  fecha_nacimiento: '',
}

// Devuelve un mensaje de error o null. Con `require`, exige los datos de
// contacto esenciales (DNI, nombres, apellidos y teléfono).
export function personalDataErrors(v: PersonalDataForm, opts: { require?: boolean } = {}): string | null {
  if (opts.require && (!v.dni || !v.nombres.trim() || !v.apellidos.trim() || !v.telefono)) {
    return 'Completa tus datos: DNI, nombres, apellidos y teléfono.'
  }
  if (v.dni && !/^\d{8}$/.test(v.dni)) return 'El DNI debe tener 8 dígitos.'
  if (v.telefono && !/^\d{9}$/.test(v.telefono)) return 'El teléfono debe tener 9 dígitos.'
  if (v.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) return 'El correo no es válido.'
  return null
}
