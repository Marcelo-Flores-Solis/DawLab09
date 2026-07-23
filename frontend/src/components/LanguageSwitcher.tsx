import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

// Selector de idioma discreto: un ícono 🌐 que despliega Español / English /
// Português. La elección se persiste en localStorage (la gestiona i18next).
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = i18n.resolvedLanguage ?? i18n.language

  // Cierra el menú al hacer clic fuera.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function choose(code: string) {
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-btn"
        aria-label={t('nav.language')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true">🌐</span>
        <span className="lang-code">{current.toUpperCase()}</span>
      </button>

      {open && (
        <ul className="lang-menu" role="listbox">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={current === lang.code}
                className={current === lang.code ? 'active' : ''}
                onClick={() => choose(lang.code)}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
