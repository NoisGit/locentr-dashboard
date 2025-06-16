import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/auth'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()
    const location = useLocation()

    const pathName = location.pathname

    // Evita redirigir si ya estamos en /sign-in
    if (!authenticated && !pathName.startsWith('/sign-in')) {
        const getPathName =
            pathName === '/' ? '' : `?${REDIRECT_URL_KEY}=${pathName}`

        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}${getPathName}`}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute
