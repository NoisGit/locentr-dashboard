import { Navigate, Outlet, useLocation } from 'react-router-dom'
import appConfig from '@/configs/app.config'
import { useAuth } from '@/auth'

const { authenticatedEntryPath } = appConfig
const AUTH_PREFIX = '/auth'
const COMMUNITY_SELECT_PATH = '/auth/community-select'

function isOnAuthPath(pathname: string) {
  return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
type UserLike = {
  roles?: unknown
  role?: unknown
  authorities?: unknown
  authority?: unknown
}
function readRoleTokens(u: unknown): string[] {
  if (!isRecord(u)) return []
  const src =
    (u as UserLike).roles ??
    (u as UserLike).role ??
    (u as UserLike).authorities ??
    (u as UserLike).authority ??
    []
  if (Array.isArray(src)) return src.map((x) => String(x).toLowerCase())
  if (src != null && (typeof src === 'string' || typeof src === 'number' || typeof src === 'boolean')) {
    return [String(src).toLowerCase()]
  }
  return []
}
function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user)
  const set = new Set(tokens)
  const hits = ['superadmin', 'super-admin', 'super_admin', 'super', 'owner', 'root']
  return hits.some((t) => set.has(t) || tokens.some((x) => x.includes(t)))
}
function clearClientSession() {
  try {
    localStorage.removeItem('sessionUser')
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    document.cookie = 'token=; Max-Age=0; path=/'
  } catch {}
}

const PublicRoute = () => {
  const { authenticated, user } = useAuth()
  const location = useLocation()
  const sp = new URLSearchParams(location.search)

  if (sp.get('logout') === '1') {
    clearClientSession()
    return <Navigate replace to="/auth/sign-in" />
  }

  if (sp.get('previewLogin') === '1') {
    clearClientSession()
    return <Outlet />
  }

  if (!authenticated) {
    return <Outlet />
  }

  const isSuper = isSuperAdminUser(user)

  if (location.pathname === COMMUNITY_SELECT_PATH) {
    if (isSuper) return <Navigate replace to={authenticatedEntryPath} />
    return <Outlet />
  }

  if (isOnAuthPath(location.pathname)) {
    return <Navigate replace to={authenticatedEntryPath} />
  }

  return <Outlet />
}

export default PublicRoute
