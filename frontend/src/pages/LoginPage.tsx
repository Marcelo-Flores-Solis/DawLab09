import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin } from '../hooks/useAuth'

interface LocationState {
  from?: string
}

export default function LoginPage() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/'

  const { mutate: doLogin, isPending, isError } = useLogin()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    doLogin(
      { username, password },
      { onSuccess: () => navigate(from, { replace: true }) }
    )
  }

  return (
    <div className="login-page">
      <div className="auth-aura" aria-hidden="true">
        <span className="aura-blob aura-blob-1" />
        <span className="aura-blob aura-blob-2" />
        <span className="aura-blob aura-blob-3" />
      </div>

      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">
            Aurum<span className="brand-accent">Store</span>
          </span>
        </div>
        <h2>{t('login.title')}</h2>
        <p className="muted login-sub">{t('login.subtitle')}</p>

        {isError && <p className="error">{t('login.error')}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder={t('login.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder={t('login.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="add-btn" type="submit" disabled={isPending}>
            {isPending ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p className="auth-switch">
          {t('login.noAccount')}{' '}
          <Link to="/registro" className="auth-switch-link">
            {t('login.goRegister')}
          </Link>
        </p>

        <Link to="/" className="continue-link">
          {t('login.back')}
        </Link>
      </div>
    </div>
  )
}
