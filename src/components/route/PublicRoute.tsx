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
  isSuperAdmin?: boolean
  superAdmin?: boolean
  is_super_admin?: boolean
  is_superadmin?: boolean
}
function tokensFrom(u: unknown): string[] {
  if (!isRecord(u)) return []
  const out: string[] = []
  const push = (val: unknown) => {
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') out.push(String(val))
  }
  const srcs = [
    (u as UserLike).roles,
    (u as UserLike).role,
    (u as UserLike).authorities,
    (u as UserLike).authority,
  ]
  for (const s of srcs) {
    if (Array.isArray(s)) {
      for (const x of s) {
        if (typeof x === 'string') out.push(x)
        else if (isRecord(x)) {
          push(x.name)
          push(x.code)
          push(x.key)
          push(x.role)
          push(x.authority)
          push(x.value)
        }
      }
    } else if (isRecord(s)) {
      push(s.name)
      push(s.code)
      push(s.key)
      push(s.role)
      push(s.authority)
      push(s.value)
    } else {
      push(s)
    }
  }
  return out.map((s) => s.toLowerCase().replace(/[^a-z]/g, ''))
}
function isSuperAdminUser(user: unknown): boolean {
  if (isRecord(user)) {
    const direct =
      (user as UserLike).isSuperAdmin ??
      (user as UserLike).superAdmin ??
      (user as UserLike).is_super_admin ??
      (user as UserLike).is_superadmin
    if (direct === true) return true
  }
  const toks = tokensFrom(user)
  const hits = ['superadmin', 'superadministrator', 'owner', 'root']
  return toks.some((t) => hits.some((h) => t.includes(h)))
}

const PublicRoute = () => {
  const { authenticated, user } = useAuth()
  const location = useLocation()

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
