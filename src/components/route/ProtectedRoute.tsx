import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'
const COMMUNITY_SELECT_PATH = `${AUTH_PREFIX}/community-select`

function isOnAuthPath(pathname: string) {
  return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function readRoleTokens(user: unknown): string[] {
  if (!isRecord(user)) return []
  const u = user as Record<string, unknown>
  const candidates: unknown[] = [u.roles, u.role, u.authorities, u.authority]
  for (const c of candidates) {
    if (Array.isArray(c)) return c.map((x) => String(x).toLowerCase())
    if (typeof c === 'string' || typeof c === 'number' || typeof c === 'boolean') {
      return [String(c).toLowerCase()]
    }
  }
  return []
}

function isSuperAdminUser(user: unknown): boolean {
  const tokens = readRoleTokens(user)
  if (tokens.length === 0) return false
  const hits = ['superadmin', 'super-admin', 'super_admin', 'super', 'owner', 'root']
  const set = new Set(tokens)
  return hits.some((t) => set.has(t) || tokens.some((x) => x.includes(t)))
}

const ProtectedRoute = () => {
  const { authenticated, user } = useAuth()
  const { selectedId } = useCommunitiesStore()
  const { pathname } = useLocation()

  if (!authenticated) {
    if (isOnAuthPath(pathname)) return <Outlet />
    const redirectQuery = pathname === '/' ? '' : `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}`
    return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
  }

  const isSuper = isSuperAdminUser(user)
  const onSelector = pathname === COMMUNITY_SELECT_PATH
  const inAuth = isOnAuthPath(pathname)

  if (isSuper) {
    if (onSelector || (inAuth && pathname !== unAuthenticatedEntryPath)) {
      return <Navigate replace to="/" />
    }
    return <Outlet />
  }

  if (!selectedId) {
    if (!onSelector) return <Navigate replace to={COMMUNITY_SELECT_PATH} />
    return <Outlet />
  }

  if (onSelector) return <Navigate replace to="/" />

  return <Outlet />
}

export default ProtectedRoute
