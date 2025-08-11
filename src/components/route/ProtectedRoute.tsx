// ProtectedRoute.tsx
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'

const { unAuthenticatedEntryPath } = appConfig 

const ProtectedRoute = () => {
  const { authenticated } = useAuth()
  const location = useLocation()
  const pathName = location.pathname

  const isOnSignIn =
    pathName === unAuthenticatedEntryPath ||
    pathName.startsWith(`${unAuthenticatedEntryPath}/`)

  if (!authenticated && !isOnSignIn) {
    const redirectQuery =
      pathName === '/' ? '' : `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathName)}`
    return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
  }

  return <Outlet />
}

export default ProtectedRoute
