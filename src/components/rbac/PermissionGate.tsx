// src/components/rbac/PermissionGate.tsx

import { ReactNode } from 'react'
import { useAuth } from '@/auth'
import { Permission, Role } from '@/utils/rbac/types'
import { RBAC } from '@/utils/rbac/rbacCore'

interface PermissionGateProps {
    /**
     * Contenido a mostrar si tiene permisos
     */
    children: ReactNode

    /**
     * Roles permitidos
     */
    roles?: Role[]

    /**
     * Permisos requeridos
     */
    permissions?: Permission[]

    /**
     * Si true, requiere TODOS los permisos. Si false, al menos uno
     */
    requireAll?: boolean

    /**
     * Contenido a mostrar si NO tiene permisos
     */
    fallback?: ReactNode

    /**
     * Si true, permite SUPERADMIN incluso sin permisos específicos
     */
    allowSuperAdmin?: boolean
}

/**
 * Componente que muestra u oculta contenido basándose en permisos
 * Útil para mostrar/ocultar botones, menús, etc.
 * 
 * @example
 * // Solo mostrar botón si tiene permiso
 * <PermissionGate permissions={[Permission.DELETE_USER]}>
 *   <Button>Eliminar Usuario</Button>
 * </PermissionGate>
 * 
 * @example
 * // Mostrar contenido alternativo si no tiene permiso
 * <PermissionGate 
 *   permissions={[Permission.EDIT_USER]}
 *   fallback={<span>No tienes permiso para editar</span>}
 * >
 *   <EditUserForm />
 * </PermissionGate>
 * 
 * @example
 * // Verificar rol
 * <PermissionGate roles={[Role.ADMIN, Role.SUPERADMIN]}>
 *   <AdminMenu />
 * </PermissionGate>
 */
const PermissionGate = ({
    children,
    roles,
    permissions,
    requireAll = true,
    fallback = null,
    allowSuperAdmin = true,
}: PermissionGateProps) => {
    const { user } = useAuth()

    // Si no hay usuario, no mostrar nada
    if (!user || !user.email) {
        return <>{fallback}</>
    }

    // Si es SUPERADMIN y se permite, mostrar contenido
    if (allowSuperAdmin && RBAC.isSuperAdmin(user)) {
        return <>{children}</>
    }

    // Verificar roles
    if (roles && roles.length > 0) {
        const hasRole = RBAC.hasAnyRole(user, roles)
        if (!hasRole) {
            return <>{fallback}</>
        }
    }

    // Verificar permisos
    if (permissions && permissions.length > 0) {
        const hasPermissions = requireAll
            ? RBAC.hasAllPermissions(user, permissions, { allowSuperAdmin })
            : RBAC.hasAnyPermission(user, permissions, { allowSuperAdmin })

        if (!hasPermissions) {
            return <>{fallback}</>
        }
    }

    // Si pasó todas las validaciones, mostrar contenido
    return <>{children}</>
}

export default PermissionGate
