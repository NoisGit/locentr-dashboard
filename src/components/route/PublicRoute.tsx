import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'
import Loading from '@/components/shared/Loading'

const { authenticatedEntryPath } = appConfig
const AUTH_PREFIX = '/auth'

function isOnAuthPath(pathname: string) {
    return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}

export default function PublicRoute() {
    const { authenticated, isAuthLoading } = useAuth()
    const { pathname } = useLocation()

    if (isAuthLoading) {
        return <Loading loading className="min-h-screen" />
    }

    if (!authenticated) return <Outlet />

    if (isOnAuthPath(pathname)) {
        return <Navigate replace to={authenticatedEntryPath} />
    }

    return <Outlet />
}
