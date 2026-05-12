import { Outlet } from 'react-router-dom'
import { useMe } from '../../../features/auth/hooks/useMe'
import { AppNavigation } from '../AppNavigation/AppNavigation'
import './AppLayout.scss'

export const AppLayout = () => {
    const { data } = useMe()
    const role = data?.user.role

    return (
        <div className="app-layout">
            <AppNavigation
                role={role}
                showCreate
                showMyCourses
            />

            <main className="app-layout__main">
                <Outlet />
            </main>
        </div>
    )
}