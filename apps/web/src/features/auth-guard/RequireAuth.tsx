import { Navigate, Outlet } from 'react-router-dom'
import { authStorage } from '../../shared/lib/auth-storage'

export const RequireAuth = () => {
  if (!authStorage.getToken()) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}