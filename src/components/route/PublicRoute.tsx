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
  const srcs = [(u as UserLike).roles, (u as UserLike).role, (u as UserLike).authorities, (u as UserLike).authority]
  for (const s of srcs) {
    if (Array.isArray(s)) {
      for (const x of s) {
        if (typeof x === 'string') out.push(x)
        else if (isRecord(x)) {
          push((x as Record<string, unknown>).name)
          push((x as Record<string, unknown>).code)
          push((x as Record<string, unknown>).key)
          push((x as Record<string, unknown>).role)
          push((x as Record<string, unknown>).authority)
          push((x as Record<string, unknown>).value)
        }
      }
    } else if (isRecord(s)) {
      push((s as Record<string, unknown>).name)
      push((s as Record<string, unknown>).code)
      push((s as Record<string, unknown>).key)
      push((s as Record<string, unknown>).role)
      push((s as Record<string, unknown>).authority)
      push((s as Record<string, unknown>).value)
    } else {
      push(s)
    }
  }
  return out.map((s) => s.toLowerCase().replace(/[^a-z]/g, ''))
}
function isSuperAdminUser(user: unknown): boolean {
  if (isRecord(user)) {
    const u = user as UserLike
    const direct = u.isSuperAdmin ?? u.superAdmin ?? u.is_super_admin ?? u.is_superadmin
    if (direct === true) return true
  }
  const toks = tokensFrom(user)
  const hits = ['superadmin', 'superadministrator', 'owner', 'root']
  return toks.some((t) => hits.some((h) => t.includes(h)))
}

export default function PublicRoute() {
  const { authenticated, user } = useAuth()
  const { pathname } = useLocation()

  // No autenticado: deja pasar todo lo público
  if (!authenticated) return <Outlet />

  const isSuper = isSuperAdminUser(user)

  // Bajo /auth/*
  if (isOnAuthPath(pathname)) {
    // SUPERADMIN nunca debe ver /auth/*
    if (isSuper) {
      if (pathname !== authenticatedEntryPath) {
        return <Navigate replace to={authenticatedEntryPath} />
      }
      return null
    }

    // ADMIN/SUBADMIN/USER solo pueden ver /auth/community-select
    if (pathname === COMMUNITY_SELECT_PATH) return <Outlet />
    if (pathname !== authenticatedEntryPath) {
      return <Navigate replace to={authenticatedEntryPath} />
    }
    return null
  }

  // Fuera de /auth/* no intervenimos
  return <Outlet />
}
