import { useEffect, useLayoutEffect, useMemo } from 'react'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { CONCEPTS_PREFIX_PATH, DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { getUserRoles } from '@/utils/authority'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'
const COMMUNITY_SELECT_PATH = `${AUTH_PREFIX}/community-select`
const STORAGE_KEY = 'current_community'
const DASHBOARD_HOME = `${DASHBOARDS_PREFIX_PATH}`
const CONDOS_LIST_PATH = `${CONCEPTS_PREFIX_PATH}/condos/condos-list`

function isOnAuthPath(pathname: string) {
  return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
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
    (u as Record<string, unknown>).authorities ||
    (u as Record<string, unknown>).authority
  return Boolean(hasAny)
}

export default function ProtectedRoute() {
  const { authenticated, user } = useAuth()
  const { selectedId, selectCommunity } = useCommunitiesStore()
  const { pathname } = useLocation()

  // Hidratar selección desde localStorage si la store viene vacía
  useEffect(() => {
    if (selectedId === undefined || selectedId === null || String(selectedId) === '') {
      const stored = readStoredSelection()
      if (stored?.id != null) {
        selectCommunity({ id: stored.id, name: stored.name ?? '' })
      }
    }
  }, [selectedId, selectCommunity])

  // No autenticado → permitir /auth/*, bloquear el resto
  if (!authenticated) {
    if (isOnAuthPath(pathname)) return <Outlet />

    // No guardar redirect si estamos haciendo logout explícito
    let isLoggingOut = false
    try {
      isLoggingOut = sessionStorage.getItem('__isLoggingOut') === 'true'
    } catch { }

    // Solo guardar redirect si es una ruta válida y NO estamos haciendo logout
    const shouldRedirect = !isLoggingOut && pathname !== '/' && !pathname.includes('/auth/')
    const redirectQuery = shouldRedirect ? `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}` : ''
    return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
  }

  // Autenticado pero user aún no hidratado → no decidir nada
  if (!userLoaded(user)) return <Outlet />

  // Roles
  const roles = getUserRoles(user)
  const isSuperAdmin = roles.has('SUPERADMIN')

  const onSelector = pathname === COMMUNITY_SELECT_PATH
  const inAuth = isOnAuthPath(pathname)

  // ¿Hay selección actual?
  const hasSelection = useMemo(() => {
    if (selectedId !== undefined && selectedId !== null && String(selectedId) !== '') return true
    return readStoredSelection() !== null
  }, [selectedId])

  // SUPERADMIN: preparar selección virtual antes de renderizar hijos
  useLayoutEffect(() => {
    if (!isSuperAdmin) return
    const missing = selectedId === undefined || selectedId === null || String(selectedId) === ''
    if (missing) {
      const virtual = { id: '__SUPER__', name: 'Comunidades' }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(virtual))
      } catch { }
      selectCommunity(virtual)
    }
  }, [isSuperAdmin, selectedId, selectCommunity])

  // SUPERADMIN: acceso libre; si cae en /auth/* lo sacamos al dashboard
  if (isSuperAdmin) {
    const missing = selectedId === undefined || selectedId === null || String(selectedId) === ''
    if (missing) return null
    if (inAuth) return <Navigate replace to={DASHBOARD_HOME} />
    // El index "/" lo redirige AllRoutes; no hacemos más redirecciones aquí
    return <Outlet />
  }

  // ADMIN / SUBADMIN

  // Si está autenticado y entra a /auth que NO sea el selector → enviar a su entry
  if (inAuth && !onSelector && pathname !== CONDOS_LIST_PATH) {
    return <Navigate replace to={CONDOS_LIST_PATH} />
  }

  // Sin selección → debe ir al selector
  if (!hasSelection) {
    if (!onSelector) return <Navigate replace to={COMMUNITY_SELECT_PATH} />
    return <Outlet />
  }

  // Con selección → no quedarse en el selector
  if (onSelector) return <Navigate replace to={CONDOS_LIST_PATH} />

  // Admin/Subadmin no entran al dashboard ni al index
  if (
    pathname === '/' ||
    pathname === DASHBOARD_HOME ||
    pathname.startsWith(`${DASHBOARDS_PREFIX_PATH}/`)
  ) {
    if (pathname !== CONDOS_LIST_PATH) return <Navigate replace to={CONDOS_LIST_PATH} />
  }

  return <Outlet />
}

