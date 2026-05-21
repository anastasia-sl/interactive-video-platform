import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../../features/auth/hooks/useAuth'
import './AppNavigation.scss'

type UserRole = 'student' | 'teacher' | 'admin'

type Props = {
  role?: UserRole
  showCreate?: boolean
  showMyCourses?: boolean
  className?: string
}

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'app-navigation__link app-navigation__link--active' : 'app-navigation__link'

export const AppNavigation = ({
                                role,
                                showCreate = false,
                                showMyCourses = false,
                                className
                              }: Props) => {
    const {isAuthenticated} = useAuth()
    const canManageCourses = role === 'teacher' || role === 'admin'

    return (
        <header className={`app-navigation ${className ?? ''}`}>
            <div className="app-navigation__container">
                <Link className="app-navigation__brand" to="/">
                    <span className="app-navigation__brand-mark">IV</span>
                    <span className="app-navigation__brand-text">Interactive Video Platform</span>
                </Link>

                <nav className="app-navigation__nav">
                    <NavLink to="/" className={getLinkClassName} end>
                        Головна
                    </NavLink>

                    <NavLink to="/courses" className={getLinkClassName}>
                        Курси
                    </NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/me" className={getLinkClassName}>
                                Мій профіль
                            </NavLink>

                            <NavLink to="/certificates" className={getLinkClassName}>
                                Мої сертифікати
                            </NavLink>

                            {showMyCourses && canManageCourses ? (
                                <NavLink to="/my-courses" className={getLinkClassName}>
                                    Мої курси
                                </NavLink>
                            ) : null}

                            {showCreate && canManageCourses ? (
                                <NavLink to="/courses/create" className={getLinkClassName}>
                                    Створити курс
                                </NavLink>
                            ) : null}
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={getLinkClassName}>
                                Увійти
                            </NavLink>

                            <NavLink to="/register" className="app-navigation__primary-link">
                                Реєстрація
                            </NavLink>
                        </>
                    )}
                </nav>

                {isAuthenticated && role ? (
                    <div className="app-navigation__user">
                        {role}
                    </div>
                ) : null}
            </div>
        </header>
    )
}