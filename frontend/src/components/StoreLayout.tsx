import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function StoreLayout() {
  return (
    <div className="store">
      <Navbar />

      <main className="store-main">
        <Outlet />
      </main>

      <footer className="store-footer">
        <p>AurumStore · Tienda demo — Laboratorio 09 · Django REST + JWT</p>
      </footer>
    </div>
  )
}
