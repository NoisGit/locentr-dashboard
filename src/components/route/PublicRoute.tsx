// PublicRoute.tsx (parche temporal)
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig 

function clearClientSession() {
  try {
    localStorage.removeItem('sessionUser')
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    document.cookie = 'token=; Max-Age=0; path=/'
  } catch {}
}

const PublicRoute = () => {
  const { authenticated } = useAuth()
  const location = useLocation()
  const sp = new URLSearchParams(location.search)

  // Bypass temporal: /auth/sign-in?previewLogin=1
  const previewLogin = sp.get('previewLogin') === '1'
  if (previewLogin) {
    clearClientSession()
   
    return <Outlet />
  }

  // Comportamiento normal
  if (authenticated) {
    return <Navigate to={authenticatedEntryPath} replace />
  }
  return <Outlet />
}

export default PublicRoute
