import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'

interface LocationState {
  from?: string
}

export default function LoginPage() {
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
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">
            Aurum<span className="brand-accent">Store</span>
          </span>
        </div>
        <h2>Bienvenido de vuelta</h2>
        <p className="muted login-sub">Inicia sesión para comprar y ver tus pedidos.</p>

        {isError && <p className="error">Usuario o contraseña incorrectos.</p>}

        <form className="form" onSubmit={handleSubmit}>
          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="add-btn" type="submit" disabled={isPending}>
            {isPending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <Link to="/" className="continue-link">
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
