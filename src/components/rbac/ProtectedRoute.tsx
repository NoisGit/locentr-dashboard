// src/components/rbac/ProtectedRoute.tsx

import { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'
import { Permission, Role } from '@/utils/rbac/types'
import { RBAC } from '@/utils/rbac/rbacCore'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig from '@/configs/app.config'

interface ProtectedRouteProps extends PropsWithChildren {
    /**
     * Roles permitidos para acceder a esta ruta
     * Si se proporciona, el usuario debe tener uno de estos roles
     */
    roles?: Role[]

    /**
     * Permisos requeridos para acceder a esta ruta
     * Si se proporciona, el usuario debe tener estos permisos
     */
    permissions?: Permission[]

    /**
     * Si true, requiere TODOS los permisos. Si false, al menos uno
     */
    requireAllPermissions?: boolean

    /**
     * Ruta a la que redirigir si no tiene acceso
     */
    fallbackPath?: string

    /**
     * Si true, permite SUPERADMIN incluso sin permisos específicos
     */
    allowSuperAdmin?: boolean
}

/**
 * Componente que protege rutas basándose en roles y permisos
 * 
 * @example
 * // Solo ADMIN y SUPERADMIN
 * <ProtectedRoute roles={[Role.ADMIN, Role.SUPERADMIN]}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Requiere permisos específicos
 * <ProtectedRoute permissions={[Permission.EDIT_USER, Permission.DELETE_USER]}>
 *   <UserManagement />
 * </ProtectedRoute>
 * 
 * @example
 * // Combinación de rol Y permisos
 * <ProtectedRoute 
 *   roles={[Role.ADMIN]} 
 *   permissions={[Permission.VIEW_USERS]}
 * >
 *   <UserList />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
    children,
    roles,
    permissions,
    requireAllPermissions = true,
    fallbackPath = '/access-denied',
    allowSuperAdmin = true,
}: ProtectedRouteProps) => {
    const { user } = useAuth()
    const location = useLocation()

    // Prevenir loop: Si ya estamos en access-denied, no redirigir
    const isAccessDeniedPage = location.pathname === '/access-denied'

    // Si no hay usuario, redirigir a login
    if (!user || !user.email) {
        // No redirigir a login si ya estamos en access-denied
        if (isAccessDeniedPage) {
            return <>{children}</>
        }

        // No guardar redirect si estamos haciendo logout explícito
        let isLoggingOut = false
        try {
            isLoggingOut = sessionStorage.getItem('__isLoggingOut') === 'true'
        } catch { }

        const currentPath =
            !isLoggingOut && location.pathname !== '/'
                ? `?${REDIRECT_URL_KEY}=${encodeURIComponent(
                      `${location.pathname}${location.search}${location.hash}`,
                  )}`
                : ''
        return <Navigate to={`${appConfig.unAuthenticatedEntryPath}${currentPath}`} replace />
    }

    // Si estamos en la página de access-denied, permitir renderizado
    if (isAccessDeniedPage) {
        return <>{children}</>
    }

    // Verificar si es SUPERADMIN y si se permite
    if (allowSuperAdmin && RBAC.isSuperAdmin(user)) {
        return <>{children}</>
    }

    // Verificar roles si se proporcionaron
    if (roles && roles.length > 0) {
        const hasRequiredRole = RBAC.hasAnyRole(user, roles)
        if (!hasRequiredRole) {
            return <Navigate to={fallbackPath} replace />
        }
    }

    // Verificar permisos si se proporcionaron
    if (permissions && permissions.length > 0) {
        const hasRequiredPermissions = requireAllPermissions
            ? RBAC.hasAllPermissions(user, permissions, { allowSuperAdmin })
            : RBAC.hasAnyPermission(user, permissions, { allowSuperAdmin })

        if (!hasRequiredPermissions) {
            return <Navigate to={fallbackPath} replace />
        }
    }

    // Si no se especificaron roles ni permisos, permitir acceso
    // (pero ya verificamos que esté autenticado)
    return <>{children}</>
}

export default ProtectedRoute
