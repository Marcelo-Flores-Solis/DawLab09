import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { logout, getUsername, isAuthenticated, getIsStaff } from '../api/auth'
import { useCart } from '../context/CartContext'

export default function StoreLayout() {
  const navigate = useNavigate()
  const { count, clear } = useCart()
  const authed = isAuthenticated()
  const staff = getIsStaff()
  const username = getUsername()

  function handleLogout() {
    clear()
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="store">
      <header className="store-header">
        <Link to="/" className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">Aurum<span className="brand-accent">Store</span></span>
        </Link>

        <nav className="store-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Tienda
          </NavLink>
          {authed && (
            <NavLink to="/mis-pedidos" className={({ isActive }) => (isActive ? 'active' : '')}>
              Mis pedidos
            </NavLink>
          )}
          {staff && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="store-header-right">
          {authed && <span className="store-user">Hola, {username || 'cliente'}</span>}
          <button className="cart-button" onClick={() => navigate('/carrito')} aria-label="Ver carrito">
            <span className="cart-icon">🛒</span>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          {authed ? (
            <button className="ghost-btn" onClick={handleLogout}>Salir</button>
          ) : (
            <button className="ghost-btn" onClick={() => navigate('/login')}>Iniciar sesión</button>
          )}
        </div>
      </header>

      <main className="store-main">
        <Outlet />
      </main>

      <footer className="store-footer">
        <p>AurumStore · Tienda demo — Laboratorio 09 · Django REST + JWT</p>
      </footer>
    </div>
  )
}
