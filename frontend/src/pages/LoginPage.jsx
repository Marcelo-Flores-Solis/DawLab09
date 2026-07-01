import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login } from '../api/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">Aurum<span className="brand-accent">Store</span></span>
        </div>
        <h2>Bienvenido de vuelta</h2>
        <p className="muted login-sub">Inicia sesión para comprar y ver tus pedidos.</p>

        {error && <p className="error">{error}</p>}

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
          <button className="add-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <Link to="/" className="continue-link">← Volver a la tienda</Link>
      </div>
    </div>
  )
}
