import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { logout, getUsername, isAuthenticated, getIsStaff } from '../api/auth'
import { useCart } from '../hooks/useCart'

// Barra de navegación de la tienda. En móvil, los enlaces y las acciones de
// sesión se colapsan en un menú que abre el botón hamburguesa; el carrito queda
// siempre visible.
export default function Navbar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { count, clear } = useCart()
  const authed = isAuthenticated()
  const staff = getIsStaff()
  const username = getUsername()

  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  function handleLogout() {
    clear()
    logout()
    // Vaciamos la caché en memoria (perfil, direcciones, pedidos…) para que la
    // sesión del siguiente usuario no herede los datos de quien acaba de salir.
    queryClient.clear()
    closeMenu()
    navigate('/', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')

  return (
    <header className="store-header">
      <Link to="/" className="brand" onClick={closeMenu}>
        <span className="brand-mark">◆</span>
        <span className="brand-name">
          Aurum<span className="brand-accent">Store</span>
        </span>
      </Link>

      <div className={`store-menu ${menuOpen ? 'open' : ''}`}>
        <nav className="store-nav" onClick={closeMenu}>
          <NavLink to="/" end className={linkClass}>
            Tienda
          </NavLink>
          {authed && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </NavLink>
          )}
          {authed && (
            <NavLink to="/mi-perfil" className={linkClass}>
              Mi perfil
            </NavLink>
          )}
          {staff && (
            <NavLink to="/admin" className={linkClass}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="store-auth">
          {authed && <span className="store-user">Hola, {username || 'cliente'}</span>}
          {authed ? (
            <button className="ghost-btn" onClick={handleLogout}>
              Salir
            </button>
          ) : (
            <button
              className="ghost-btn"
              onClick={() => {
                closeMenu()
                navigate('/login')
              }}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>

      <div className="store-actions">
        <button
          className="cart-button"
          onClick={() => {
            closeMenu()
            navigate('/carrito')
          }}
          aria-label="Ver carrito"
        >
          <span className="cart-icon">🛒</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
        <button
          className="nav-toggle"
          aria-label="Menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
