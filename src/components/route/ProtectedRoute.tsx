import { useEffect, useMemo } from 'react'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'
const COMMUNITY_SELECT_PATH = `${AUTH_PREFIX}/community-select`
const STORAGE_KEY = 'current_community'

function isOnAuthPath(pathname: string) {
  return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function tokensFrom(user: unknown): string[] {
  if (!isRecord(user)) return []
  const out: string[] = []
  const push = (val: unknown) => {
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') out.push(String(val))
  }
  const cand = [
    (user as Record<string, unknown>).roles,
    (user as Record<string, unknown>).role,
    (user as Record<string, unknown>).authorities,
    (user as Record<string, unknown>).authority,
    (user as Record<string, unknown>).permissions,
    (user as Record<string, unknown>).scopes,
  ]
  for (const c of cand) {
    if (Array.isArray(c)) {
      for (const x of c) {
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
    } else if (isRecord(c)) {
      push(c.name)
      push(c.code)
      push(c.key)
      push(c.role)
      push(c.authority)
      push(c.value)
    } else {
      push(c)
    }
  }
  return out.map((s) => s.toLowerCase().replace(/[^a-z]/g, ''))
}

function isSuperAdminUser(user: unknown): boolean {
  if (isRecord(user)) {
    const direct =
      (user as Record<string, unknown>).isSuperAdmin ??
      (user as Record<string, unknown>).superAdmin ??
      (user as Record<string, unknown>).is_super_admin ??
      (user as Record<string, unknown>).is_superadmin
    if (direct === true) return true
  }
  const toks = tokensFrom(user)
  if (!toks.length) return false
  const hits = ['superadmin', 'superadministrator', 'owner', 'root']
  return toks.some((t) => hits.some((h) => t.includes(h)))
}

function readStoredSelection(): { id?: string | number; name?: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw) as { id?: string | number; name?: string }
    if (obj?.id === undefined || obj?.id === null) return null
    const s = String(obj.id)
    if (s.trim() === '') return null
    return obj
  } catch {
    return null
  }
}

function userLoaded(u: unknown): boolean {
  if (!isRecord(u)) return false
  const keys = Object.keys(u)
  if (keys.length === 0) return false
  const hasAny =
    (u as Record<string, unknown>).email ||
    (u as Record<string, unknown>).id ||
    (u as Record<string, unknown>).user_id ||
    (u as Record<string, unknown>).uid ||
    (u as Record<string, unknown>).roles ||
    (u as Record<string, unknown>).authorities
  return Boolean(hasAny)
}

const ProtectedRoute = () => {
  const { authenticated, user } = useAuth()
  const { selectedId, selectCommunity } = useCommunitiesStore()
  const { pathname } = useLocation()

  useEffect(() => {
    if (selectedId === undefined || selectedId === null || String(selectedId) === '') {
      const stored = readStoredSelection()
      if (stored?.id != null) {
        selectCommunity({ id: stored.id, name: stored.name ?? '' })
      }
    }
  }, [selectedId, selectCommunity])

  if (!authenticated) {
    if (isOnAuthPath(pathname)) return <Outlet />
    const redirectQuery = pathname === '/' ? '' : `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}`
    return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
  }

  const superAdmin = isSuperAdminUser(user)
  const onSelector = pathname === COMMUNITY_SELECT_PATH
  const inAuth = isOnAuthPath(pathname)

  const hasSelection = useMemo(() => {
    if (selectedId !== undefined && selectedId !== null && String(selectedId) !== '') return true
    return readStoredSelection() !== null
  }, [selectedId])

  const hydrated = userLoaded(user)

  if (!hydrated) {
    return <Outlet />
  }

  if (superAdmin) {
    if (onSelector || (inAuth && pathname !== unAuthenticatedEntryPath)) {
      return <Navigate replace to="/" />
    }
    return <Outlet />
  }

  if (!hasSelection) {
    if (!onSelector) return <Navigate replace to={COMMUNITY_SELECT_PATH} />
    return <Outlet />
  }

  if (onSelector) return <Navigate replace to="/" />

  return <Outlet />
}

export default ProtectedRoute
