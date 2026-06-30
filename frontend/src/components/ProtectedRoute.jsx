import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'

export default function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}
