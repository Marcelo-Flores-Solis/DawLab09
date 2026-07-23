import 'i18next'
import type es from './locales/es'

// Tipa las claves de traducción a partir del locale español (fuente de verdad),
// para que `t('...')` tenga autocompletado y falle en compilación si hay typos.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof es
    }
  }
}
