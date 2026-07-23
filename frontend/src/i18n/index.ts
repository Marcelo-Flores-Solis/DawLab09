import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import es from './locales/es'
import en from './locales/en'
import pt from './locales/pt'

// Idiomas soportados. El primero es también el de reserva.
export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

const resources = {
  es: { translation: es },
  en: { translation: en },
  pt: { translation: pt },
}

i18n
  // Detecta el idioma: primero la elección guardada (localStorage), luego el
  // navegador. Si no es ES/EN/PT, cae a español.
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'pt'],
    // Sólo nos importa el idioma base: 'en-US' o 'pt-BR' se resuelven a 'en'/'pt'.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false }, // React ya escapa el HTML.
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
  })

export default i18n
