import { RBAC } from '@/utils/rbac/rbacCore'
import type { CommonProps } from '@/@types/common'
import type { Role, Permission } from '@/utils/rbac/types'

interface AuthorityCheckProps extends CommonProps {
    userAuthority: unknown
    roles?: Role[]
    permissions?: Permission[]
    requireAllPermissions?: boolean
}

const AuthorityCheck = (props: AuthorityCheckProps) => {
    const {
        userAuthority = [],
        roles = [],
        permissions = [],
        requireAllPermissions = true,
        children,
    } = props

    const hasRequiredRole = roles.length === 0 || RBAC.hasAnyRole(userAuthority, roles)
    const hasRequiredPermissions =
        permissions.length === 0 ||
        RBAC.checkPermissions(userAuthority, permissions, {
            requireAll: requireAllPermissions,
        }).allowed

    const allowed =
        RBAC.isSuperAdmin(userAuthority) || (hasRequiredRole && hasRequiredPermissions)

    return <>{allowed ? children : null}</>
}

export default AuthorityCheck
