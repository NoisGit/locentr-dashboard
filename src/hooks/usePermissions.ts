// src/hooks/usePermissions.ts

import { useMemo } from 'react'
import { useAuth } from '@/auth'
import { Permission, Role, PermissionCheckOptions } from '@/utils/rbac/types'
import { RBAC } from '@/utils/rbac/rbacCore'

/**
 * Hook para verificar permisos del usuario actual
 * 
 * @example
 * const { hasPermission, hasRole, isSuperAdmin } = usePermissions()
 * 
 * if (hasPermission(Permission.EDIT_USER)) {
 *   // Mostrar botón editar
 * }
 * 
 * if (hasRole(Role.ADMIN)) {
 *   // Mostrar panel admin
 * }
 */
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
        options?: PermissionCheckOptions
    ) => {
        return RBAC.hasPermission(user, permission, options)
    }

    const hasAllPermissions = (
        requiredPermissions: Permission[],
        options?: PermissionCheckOptions
    ) => {
        return RBAC.hasAllPermissions(user, requiredPermissions, options)
    }

    const hasAnyPermission = (
        requiredPermissions: Permission[],
        options?: PermissionCheckOptions
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
        options?: PermissionCheckOptions
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

/**
 * Hook para verificar si el usuario tiene un permiso específico
 * Retorna boolean directamente
 * 
 * @example
 * const canEdit = useHasPermission(Permission.EDIT_USER)
 * 
 * return (
 *   <Button disabled={!canEdit}>
 *     Editar Usuario
 *   </Button>
 * )
 */
export const useHasPermission = (
    permission: Permission,
    options?: PermissionCheckOptions
): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasPermission(user, permission, options)
    }, [user, permission, options])
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * 
 * @example
 * const isAdmin = useHasRole(Role.ADMIN)
 * 
 * if (isAdmin) {
 *   // Lógica específica para admin
 * }
 */
export const useHasRole = (role: Role): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasRole(user, role)
    }, [user, role])
}

/**
 * Hook para verificar si el usuario tiene alguno de los roles especificados
 * 
 * @example
 * const isAdminOrSubadmin = useHasAnyRole([Role.ADMIN, Role.SUBADMIN])
 */
export const useHasAnyRole = (roles: Role[]): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.hasAnyRole(user, roles)
    }, [user, roles])
}

/**
 * Hook para verificar si el usuario es SUPERADMIN
 * 
 * @example
 * const isSuperAdmin = useIsSuperAdmin()
 * 
 * if (isSuperAdmin) {
 *   // Funcionalidad solo para super admin
 * }
 */
export const useIsSuperAdmin = (): boolean => {
    const { user } = useAuth()

    return useMemo(() => {
        return RBAC.isSuperAdmin(user)
    }, [user])
}
