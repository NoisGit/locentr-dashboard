import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import Loading from '@/components/shared/Loading'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'

function isOnAuthPath(pathname: string) {
    return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}

export default function ProtectedRoute() {
    const { authenticated, isAuthLoading } = useAuth()
    const { pathname } = useLocation()

    if (isAuthLoading) {
        return <Loading loading className="min-h-screen" />
    }

    if (!authenticated) {
        if (isOnAuthPath(pathname)) return <Outlet />

        let isLoggingOut = false
        try {
            isLoggingOut = sessionStorage.getItem('__isLoggingOut') === 'true'
        } catch { }

        const shouldRedirect = !isLoggingOut && pathname !== '/' && !isOnAuthPath(pathname)
        const redirectQuery = shouldRedirect
            ? `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}`
            : ''

        return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
    }

    if (isOnAuthPath(pathname)) {
        return <Navigate replace to={DASHBOARDS_PREFIX_PATH} />
    }

    return <Outlet />
}
