import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { logout, getUsername } from '../api/auth'
import LanguageSwitcher from './LanguageSwitcher'
import '../admin.css'

export default function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const username = getUsername()

  const links = [
    { to: '/admin', label: t('admin.nav.products'), end: true },
    { to: '/admin/categorias', label: t('admin.nav.categories') },
    { to: '/admin/pedidos', label: t('admin.nav.orders') },
    { to: '/admin/direcciones', label: t('admin.nav.addresses') },
  ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-panel">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="brand-mark">◆</span> {t('admin.title')}
        </div>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-topbar-right">
          <span className="admin-user">{username}</span>
          <LanguageSwitcher />
          <Link to="/" className="ghost-btn">
            {t('admin.viewStore')}
          </Link>
          <button className="ghost-btn" onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        </div>
      </header>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
