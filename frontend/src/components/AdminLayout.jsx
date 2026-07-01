import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { logout, getUsername } from '../api/auth'
import '../admin.css'

const links = [
  { to: '/admin', label: 'Productos', end: true },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/direcciones', label: 'Direcciones' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const username = getUsername()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-panel">
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="brand-mark">◆</span> Panel admin
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
          <Link to="/" className="ghost-btn">Ver tienda</Link>
          <button className="ghost-btn" onClick={handleLogout}>Salir</button>
        </div>
      </header>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
