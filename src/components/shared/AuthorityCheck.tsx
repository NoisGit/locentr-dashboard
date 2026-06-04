import useAuthority from '@/utils/hooks/useAuthority'
import { RBAC } from '@/utils/rbac/rbacCore'
import type { CommonProps } from '@/@types/common'
import type { Role, Permission } from '@/utils/rbac/types'

interface AuthorityCheckProps extends CommonProps {
    userAuthority: unknown
    authority?: unknown
    roles?: Role[]
    permissions?: Permission[]
    requireAllPermissions?: boolean
}

const AuthorityCheck = (props: AuthorityCheckProps) => {
    const {
        userAuthority = [],
        authority = [],
        roles = [],
        permissions = [],
        requireAllPermissions = true,
        children,
    } = props

    const legacyMatched = useAuthority(userAuthority, authority)
    const hasRequiredRole = roles.length === 0 || RBAC.hasAnyRole(userAuthority, roles)
    const hasRequiredPermissions =
        permissions.length === 0 ||
        RBAC.checkPermissions(userAuthority, permissions, {
            requireAll: requireAllPermissions,
        }).allowed

    const rbacMatched =
        RBAC.isSuperAdmin(userAuthority) || (hasRequiredRole && hasRequiredPermissions)
    const allowed = roles.length || permissions.length ? rbacMatched : legacyMatched

    return <>{allowed ? children : null}</>
}

export default AuthorityCheck
