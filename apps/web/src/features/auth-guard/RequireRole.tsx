import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../../shared/types/auth'
import { useMe } from '../auth/hooks/useMe'

interface RequireRoleProps {
  roles: UserRole[]
}

export const RequireRole = ({ roles }: RequireRoleProps) => {
  const { data, isLoading } = useMe()

  if (isLoading) {
    return <p>Завантаження...</p>
  }

  if (!data || !roles.includes(data.user.role)) {
    return <Navigate to="/me" replace />
  }

  return <Outlet />
}