import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { notify } = useToast()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { mutate: doRegister, isPending } = useRegister()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Validación en el cliente (mensajes traducidos) antes de llamar al backend.
    if (password.length < 6) {
      setError(t('register.errorShort'))
      return
    }
    if (password !== confirm) {
      setError(t('register.errorMismatch'))
      return
    }

    doRegister(
      { username, password, email: email.trim() },
      {
        onSuccess: () => {
          notify(t('register.success'))
          navigate('/', { replace: true })
        },
        onError: (err) => {
          const code = err instanceof Error ? err.message : 'generic'
          const key =
            code === 'username_taken'
              ? 'register.errorUserTaken'
              : code === 'weak_password'
                ? 'register.errorWeakPassword'
                : 'register.errorGeneric'
          setError(t(key))
        },
      }
    )
  }

  return (
    <div className="login-page">
      <div className="auth-aura" aria-hidden="true">
        <span className="aura-blob aura-blob-1" />
        <span className="aura-blob aura-blob-2" />
        <span className="aura-blob aura-blob-3" />
      </div>

      <div className="auth-lang">
        <LanguageSwitcher />
      </div>

      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">
            Aurum<span className="brand-accent">Store</span>
          </span>
        </div>
        <h2>{t('register.title')}</h2>
        <p className="muted login-sub">{t('register.subtitle')}</p>

        {error && <p className="error">{error}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder={t('register.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            type="email"
            placeholder={t('register.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder={t('register.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            type="password"
            placeholder={t('register.confirm')}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <span className="field-hint">{t('register.passwordHint')}</span>
          <button className="add-btn" type="submit" disabled={isPending}>
            {isPending ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p className="auth-switch">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="auth-switch-link">
            {t('register.goLogin')}
          </Link>
        </p>

        <Link to="/" className="continue-link">
          {t('register.back')}
        </Link>
      </div>
    </div>
  )
}
