import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { RBAC } from '@/utils/rbac/rbacCore'
import type { Role, Permission } from '@/utils/rbac/types'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: unknown
    roles?: Role[]
    permissions?: Permission[]
    requireAllPermissions?: boolean
}>

const AuthorityGuard = ({
    userAuthority,
    roles = [],
    permissions = [],
    requireAllPermissions = true,
    children,
}: AuthorityGuardProps) => {
    const hasRequiredRole = roles.length === 0 || RBAC.hasAnyRole(userAuthority, roles)
    const hasRequiredPermissions =
        permissions.length === 0 ||
        RBAC.checkPermissions(userAuthority, permissions, {
            requireAll: requireAllPermissions,
        }).allowed

    const allowed =
        RBAC.isSuperAdmin(userAuthority) || (hasRequiredRole && hasRequiredPermissions)

    if (!allowed) {
        return <Navigate to={DASHBOARDS_PREFIX_PATH} replace />
    }

    return <>{children}</>
}

export default AuthorityGuard
