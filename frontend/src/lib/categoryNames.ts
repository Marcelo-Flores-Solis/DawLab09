// Traducción de los nombres de categoría, que viven en la base de datos (no en
// los archivos de i18n). Es un diccionario por idioma: la clave es el nombre
// canónico tal como está guardado (en español, MAYÚSCULAS). Si una categoría no
// está en el diccionario —por ejemplo, una nueva que cree el admin— se muestra
// su nombre original sin romper nada.
//
// El español no necesita mapa: el fallback devuelve el nombre guardado.
const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  en: {
    CELULARES: 'PHONES',
    LAPTOPS: 'LAPTOPS',
    TABLETS: 'TABLETS',
    AUDIO: 'AUDIO',
    MONITORES: 'MONITORS',
    GAMING: 'GAMING',
    ACCESORIOS: 'ACCESSORIES',
    WEARABLES: 'WEARABLES',
  },
  pt: {
    CELULARES: 'CELULARES',
    LAPTOPS: 'LAPTOPS',
    TABLETS: 'TABLETS',
    AUDIO: 'ÁUDIO',
    MONITORES: 'MONITORES',
    GAMING: 'GAMING',
    ACCESORIOS: 'ACESSÓRIOS',
    WEARABLES: 'WEARABLES',
  },
}

export function translateCategory(name: string, lang: string): string {
  return CATEGORY_NAMES[lang]?.[name] ?? name
}
