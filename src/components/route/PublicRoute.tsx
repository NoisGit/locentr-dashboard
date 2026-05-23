import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig
const AUTH_PREFIX = '/auth'

function isOnAuthPath(pathname: string) {
    return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}

export default function PublicRoute() {
    const { authenticated } = useAuth()
    const { pathname } = useLocation()

    if (!authenticated) return <Outlet />

    if (isOnAuthPath(pathname)) {
        return <Navigate replace to={authenticatedEntryPath} />
    }

    return <Outlet />
}
