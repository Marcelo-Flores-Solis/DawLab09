// Tipo, valor inicial y validación de los datos personales. Vive fuera del
// componente para no romper el fast-refresh (un .tsx sólo debe exportar
// componentes).

import i18n from '../i18n'

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
    return i18n.t('validation.required')
  }
  if (v.dni && !/^\d{8}$/.test(v.dni)) return i18n.t('validation.dni')
  if (v.telefono && !/^\d{9}$/.test(v.telefono)) return i18n.t('validation.telefono')
  if (v.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) return i18n.t('validation.correo')
  return null
}
