import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { logout, getUsername, isAuthenticated, getIsStaff } from '../api/auth'
import { useCart } from '../hooks/useCart'
import LanguageSwitcher from './LanguageSwitcher'

// Barra de navegación de la tienda. En móvil, los enlaces y las acciones de
// sesión se colapsan en un menú que abre el botón hamburguesa; el carrito queda
// siempre visible.
export default function Navbar() {
  const { t } = useTranslation()
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
            {t('nav.store')}
          </NavLink>
          {authed && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              {t('nav.myOrders')}
            </NavLink>
          )}
          {authed && (
            <NavLink to="/mi-perfil" className={linkClass}>
              {t('nav.myProfile')}
            </NavLink>
          )}
          {staff && (
            <NavLink to="/admin" className={linkClass}>
              {t('nav.adminPanel')}
            </NavLink>
          )}
        </nav>

        <div className="store-auth">
          {authed && (
            <span className="store-user">
              {t('nav.hello', { name: username || t('nav.client') })}
            </span>
          )}
          <LanguageSwitcher />
          {authed ? (
            <button className="ghost-btn" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          ) : (
            <button
              className="ghost-btn"
              onClick={() => {
                closeMenu()
                navigate('/login')
              }}
            >
              {t('nav.login')}
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
          aria-label={t('nav.viewCart')}
        >
          <span className="cart-icon">🛒</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
        <button
          className="nav-toggle"
          aria-label={t('nav.menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
