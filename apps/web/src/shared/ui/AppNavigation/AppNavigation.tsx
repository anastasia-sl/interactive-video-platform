import { Link } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'

type UserRole = 'student' | 'teacher' | 'admin'

type Props = {
  role?: UserRole
  showCreate?: boolean
  showMyCourses?: boolean
  className?: string
}

export const AppNavigation = ({
                                role,
                                showCreate = false,
                                showMyCourses = false,
                                className
                              }: Props) => {
  const { isAuthenticated } = useAuth()
  const canManageCourses = role === 'teacher' || role === 'admin'

  const navClassName = className ? className : ''

  return (
    <nav className={navClassName}>
      <Link to="/">Головна</Link>
      {' | '}
      <Link to="/courses">Курси</Link>

      {!isAuthenticated ? (
        <>
          {' | '}
          <Link to="/register">Реєстрація</Link>
          {' | '}
          <Link to="/login">Вхід</Link>
        </>
      ) : (
        <>
          {' | '}
          <Link to="/me">Мій профіль</Link>

          {showMyCourses && canManageCourses ? (
            <>
              {' | '}
              <Link to="/my-courses">Мої курси</Link>
            </>
          ) : null}

          {showCreate && canManageCourses ? (
            <>
              {' | '}
              <Link to="/courses/create">Створити курс</Link>
            </>
          ) : null}
        </>
      )}
    </nav>
  )
}