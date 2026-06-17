import { PropsWithChildren } from 'react'
import AccessDenied from '@/views/others/AccessDenied'
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
        return <AccessDenied />
    }

    return <>{children}</>
}

export default AuthorityGuard
