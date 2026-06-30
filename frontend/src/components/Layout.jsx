import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'

const links = [
  { to: '/', label: 'Productos', end: true },
  { to: '/categorias', label: 'Categorías' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/direcciones', label: 'Direcciones' },
]

export default function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <header className="topbar">
        <h1>E-commerce Admin</h1>
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
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
