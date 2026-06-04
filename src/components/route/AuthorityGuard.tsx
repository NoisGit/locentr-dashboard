import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { RBAC } from '@/utils/rbac/rbacCore'
import type { Role, Permission } from '@/utils/rbac/types'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: unknown
    authority?: unknown
    roles?: Role[]
    permissions?: Permission[]
    requireAllPermissions?: boolean
}>

const AuthorityGuard = ({
    userAuthority,
    authority,
    roles = [],
    permissions = [],
    requireAllPermissions = true,
    children,
}: AuthorityGuardProps) => {
    const hasLegacyAccess = useAuthority(userAuthority, authority)
    const hasRequiredRole = roles.length === 0 || RBAC.hasAnyRole(userAuthority, roles)
    const hasRequiredPermissions =
        permissions.length === 0 ||
        RBAC.checkPermissions(userAuthority, permissions, {
            requireAll: requireAllPermissions,
        }).allowed

    const hasRbacAccess =
        RBAC.isSuperAdmin(userAuthority) || (hasRequiredRole && hasRequiredPermissions)
    const allowed = roles.length || permissions.length ? hasRbacAccess : hasLegacyAccess

    if (!allowed) {
        return <Navigate to={DASHBOARDS_PREFIX_PATH} replace />
    }

    return <>{children}</>
}

export default AuthorityGuard
