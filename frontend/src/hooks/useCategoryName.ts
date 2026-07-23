import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateCategory } from '../lib/categoryNames'

// Devuelve una función que traduce un nombre de categoría al idioma actual.
// Estable por idioma (useCallback), así se puede usar dentro de useMemo sin
// recalcular en cada render. Reacciona al cambio de idioma del selector 🌐.
export function useCategoryName() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? i18n.language
  return useCallback((name: string) => translateCategory(name, lang), [lang])
}
