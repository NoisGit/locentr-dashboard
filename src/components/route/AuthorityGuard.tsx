import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { getUserRoles } from '@/utils/authority'
import { CONCEPTS_PREFIX_PATH, DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'

type AuthorityGuardProps = PropsWithChildren<{
  userAuthority?: unknown
  authority?: unknown
}>

const CONDOS_LIST_PATH = `${CONCEPTS_PREFIX_PATH}/condos/condos-list`

const HIDDEN_FOR_ADMIN: string[] = [
  `${DASHBOARDS_PREFIX_PATH}`,
  `${CONCEPTS_PREFIX_PATH}/ai`,
  `${CONCEPTS_PREFIX_PATH}/users`,
  `${CONCEPTS_PREFIX_PATH}/accesses`,
  `${CONCEPTS_PREFIX_PATH}/perks`,
  `${CONCEPTS_PREFIX_PATH}/marketplace`,
  `${CONCEPTS_PREFIX_PATH}/account/roles-permissions`,
  `${CONCEPTS_PREFIX_PATH}/account/pricing`,
  `${CONCEPTS_PREFIX_PATH}/chat`,
  `${CONCEPTS_PREFIX_PATH}/calendar`,
]
const HIDDEN_FOR_SUBADMIN: string[] = [...HIDDEN_FOR_ADMIN]

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname.startsWith(p))
}

// ⬇️ Helper local para detectar selección virtual (__SUPER__)
function hasVirtualSuperSelection(): boolean {
  try {
    const raw = localStorage.getItem('current_community')
    if (!raw) return false
    const obj = JSON.parse(raw) as { id?: unknown }
    return typeof obj?.id === 'string' && obj.id.startsWith('__')
  } catch {
    return false
  }
}

const AuthorityGuard = ({ userAuthority, authority, children }: AuthorityGuardProps) => {
  const { pathname } = useLocation()

  const roles = getUserRoles(userAuthority)
  const isSuperAdmin = roles.has('SUPERADMIN')

  // ⬇️ Falla-cerrada a SUPERADMIN si hay selección virtual (__SUPER__)
  if (isSuperAdmin || hasVirtualSuperSelection()) {
    return <>{children}</>
  }

  const isAdmin = roles.has('ADMIN')
  const isSubadmin = roles.has('SUBADMIN')

  const hiddenPrefixes =
    isSubadmin ? HIDDEN_FOR_SUBADMIN :
    isAdmin ? HIDDEN_FOR_ADMIN :
    []

  if (startsWithAny(pathname, hiddenPrefixes)) {
    if (pathname !== CONDOS_LIST_PATH) return <Navigate to={CONDOS_LIST_PATH} replace />
    return <>{children}</>
  }

  // Marcha blanca: ADMIN/SUBADMIN pueden navegar todo /concepts/* no oculto
  if ((isAdmin || isSubadmin) && pathname.startsWith(`${CONCEPTS_PREFIX_PATH}/`)) {
    return <>{children}</>
  }

  const roleMatched = useAuthority(userAuthority as string[] | unknown, authority as string[] | unknown)

  if (!roleMatched) {
    if (pathname === CONDOS_LIST_PATH) return <>{children}</>
    return <Navigate to={CONDOS_LIST_PATH} replace />
  }

  return <>{children}</>
}

export default AuthorityGuard
