import { useMemo } from 'react'
import { useAuth } from '@/auth'
import { Permission, Role, PermissionCheckOptions } from '@/utils/rbac/types'
import { RBAC } from '@/utils/rbac/rbacCore'

export const usePermissions = () => {
    const { user } = useAuth()

    const permissions = useMemo(() => {
        return RBAC.getUserPermissions(user)
    }, [user])

    const userRole = useMemo(() => {
        return RBAC.extractUserRole(user)
    }, [user])

    const isSuperAdmin = useMemo(() => {
        return RBAC.isSuperAdmin(user)
    }, [user])

    const hasPermission = (
        permission: Permission,
        options?: PermissionCheckOptions,
    ) => {
        return RBAC.hasPermission(user, permission, options)
    }

    const hasAllPermissions = (
        requiredPermissions: Permission[],
        options?: PermissionCheckOptions,
    ) => {
        return RBAC.hasAllPermissions(user, requiredPermissions, options)
    }

    const hasAnyPermission = (
        requiredPermissions: Permission[],
        options?: PermissionCheckOptions,
    ) => {
        return RBAC.hasAnyPermission(user, requiredPermissions, options)
    }

    const hasRole = (role: Role) => {
        return RBAC.hasRole(user, role)
    }

    const hasAnyRole = (roles: Role[]) => {
        return RBAC.hasAnyRole(user, roles)
    }

    const checkPermissions = (
        requiredPermissions: Permission[],
        options?: PermissionCheckOptions,
    ) => {
        return RBAC.checkPermissions(user, requiredPermissions, options)
    }

    return {
        user,
        permissions,
        userRole,
        isSuperAdmin,
        hasPermission,
        hasAllPermissions,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        checkPermissions,
    }
}

export const useHasPermission = (
    permission: Permission,
    options?: PermissionCheckOptions,
): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasPermission(user, permission, options)
    }, [user, permission, options])
}

export const useHasRole = (role: Role): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasRole(user, role)
    }, [user, role])
}

export const useHasAnyRole = (roles: Role[]): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasAnyRole(user, roles)
    }, [user, roles])
}

export const useIsSuperAdmin = (): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.isSuperAdmin(user)
    }, [user])
}
