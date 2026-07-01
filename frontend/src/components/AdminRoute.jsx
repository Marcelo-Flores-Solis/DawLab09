import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, getIsStaff } from '../api/auth'

// Protege el panel de administración: exige sesión y rol staff.
export default function AdminRoute() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (!getIsStaff()) return <Navigate to="/" replace />
  return <Outlet />
}
