// src/utils/rbac/rbacCore.ts

import {
    Role,
    Permission,
    AuthUser,
    ROLE_PERMISSIONS,
    PermissionCheckOptions,
    PermissionCheckResult,
    ROLE_IDS,
} from './types'
import { getCoredeckRole, getCoredeckRoleLabel } from './roleAliases'

/**
 * Convierte un ID de rol de la base de datos al enum Role
 */
export function roleIdToRole(roleId: unknown): Role | null {
    if (typeof roleId === 'number' || typeof roleId === 'string') {
        const id = Number(roleId)

        switch (id) {
            case ROLE_IDS.SUPERADMIN:
                return Role.SUPERADMIN
            case ROLE_IDS.ADMIN:
                return Role.ADMIN
            case ROLE_IDS.SUBADMIN:
                return Role.SUBADMIN
            default:
                return null
        }
    }
    return null
}

/**
 * Normaliza un rol a su valor enum correcto
 * Maneja diferentes formatos: 'admin', 'ADMIN', 'Admin', 'super_admin', etc.
 */
export function normalizeRole(role: unknown): Role | null {
    if (typeof role !== 'string') return null

    const normalized = role
        .trim()
        .toUpperCase()
        .replace(/[-_\s]/g, '') // Elimina guiones, underscores y espacios

    // Mapeo de variaciones comunes (inglés y español)
    const roleMap: Record<string, Role> = {
        // SUPERADMIN
        'SUPERADMIN': Role.SUPERADMIN,
        'SUPER_ADMIN': Role.SUPERADMIN,
        'SUPERADMINISTRADOR': Role.SUPERADMIN,
        'OWNER': Role.SUPERADMIN,
        'ROOT': Role.SUPERADMIN,

        // ADMIN
        'ADMIN': Role.ADMIN,
        'ADMINISTRATOR': Role.ADMIN,
        'ADMINISTRADOR': Role.ADMIN,

        // SUBADMIN
        'SUBADMIN': Role.SUBADMIN,
        'SUB_ADMIN': Role.SUBADMIN,
        'SUBADMINISTRADOR': Role.SUBADMIN,
    }

    return roleMap[normalized] ?? null
}

/**
 * Extrae el rol de un usuario desde diferentes estructuras
 */
export function extractUserRole(user: unknown): Role | null {
    if (!user || typeof user !== 'object') return null

    const u = user as Record<string, unknown>

    // Detectar usuario vacío (después de logout) y retornar silenciosamente
    const isEmpty =
        Object.keys(u).length === 0 ||
        (Object.keys(u).length <= 3 &&
            (!u.email || u.email === '') &&
            (!u.id && !u.user_id && !u.uid))

    if (isEmpty) return null

    // DEBUG: Ver estructura del usuario
    console.log('🔍 extractUserRole - user object:', u)

    // PRIORIDAD 1: Intentar extraer por role_id (más confiable)
    const roleIdCandidates = [
        u.role_id,
        u.roleId,
        typeof u.role === 'object' ? (u.role as Record<string, unknown>).id : undefined,
    ]

    console.log('🔍 extractUserRole - roleIdCandidates:', roleIdCandidates)

    for (const roleId of roleIdCandidates) {
        if (roleId !== undefined && roleId !== null) {
            const role = roleIdToRole(roleId)
            if (role) {
                console.log('✅ extractUserRole - Rol encontrado por ID:', role, 'ID:', roleId)
                return role
            }
        }
    }

    // PRIORIDAD 2: Verificar si es SUPERADMIN por flags
    const superAdminFlags = [
        u.isSuperAdmin,
        u.superAdmin,
        u.is_super_admin,
        u.is_superadmin,
        u.superadmin,
    ]

    if (superAdminFlags.some(flag => flag === true || flag === 'true')) {
        console.log('✅ extractUserRole - Detectado SUPERADMIN por flag')
        return Role.SUPERADMIN
    }

    // PRIORIDAD 3: Intentar extraer por nombre del rol
    const roleCandidates = [
        u.role,
        Array.isArray(u.roles) ? u.roles[0] : undefined,
        Array.isArray(u.authority) ? u.authority[0] : undefined,
        Array.isArray(u.authorities) ? u.authorities[0] : undefined,
        u.userRole,
        u.user_role,
        u.roleType,
    ]

    console.log('🔍 extractUserRole - roleCandidates (por nombre):', roleCandidates)

    for (const candidate of roleCandidates) {
        if (!candidate) continue

        // Si es objeto, intentar extraer el nombre
        if (typeof candidate === 'object') {
            const roleObj = candidate as Record<string, unknown>
            const roleName = roleObj.name ?? roleObj.role ?? roleObj.code ?? roleObj.key
            if (roleName) {
                const normalized = normalizeRole(roleName)
                if (normalized) {
                    console.log('✅ extractUserRole - Rol encontrado por nombre (object):', normalized)
                    return normalized
                }
            }
        }

        // Si es string directo
        const normalized = normalizeRole(candidate)
        if (normalized) {
            console.log('✅ extractUserRole - Rol encontrado por nombre (string):', normalized)
            return normalized
        }
    }

    console.warn('⚠️ extractUserRole - No se encontró un rol válido')
    return null
}

/**
 * Obtiene los permisos de un usuario
 * Puede venir directo del usuario o se calcula desde su rol
 */
export function getUserPermissions(user: AuthUser | unknown): Permission[] {
    if (!user || typeof user !== 'object') return []

    const u = user as AuthUser

    // Si el usuario ya tiene permisos asignados, usarlos
    if (Array.isArray(u.permissions) && u.permissions.length > 0) {
        return u.permissions
    }

    // Si no, calcular desde el rol
    const role = u.role ?? extractUserRole(user)
    if (!role) return []

    return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(user: AuthUser | unknown, role: Role): boolean {
    const userRole = (user as AuthUser)?.role ?? extractUserRole(user)
    return userRole === role
}

/**
 * Verifica si un usuario tiene alguno de los roles especificados
 */
export function hasAnyRole(user: AuthUser | unknown, roles: Role[]): boolean {
    const userRole = (user as AuthUser)?.role ?? extractUserRole(user)
    return userRole ? roles.includes(userRole) : false
}

/**
 * Verifica si un usuario es SUPERADMIN
 */
export function isSuperAdmin(user: AuthUser | unknown): boolean {
    return hasRole(user, Role.SUPERADMIN)
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(
    user: AuthUser | unknown,
    permission: Permission,
    options: PermissionCheckOptions = {}
): boolean {
    const { allowSuperAdmin = true } = options

    // SUPERADMIN siempre tiene todos los permisos
    if (allowSuperAdmin && isSuperAdmin(user)) {
        return true
    }

    const userPermissions = getUserPermissions(user)
    return userPermissions.includes(permission)
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 */
export function hasAllPermissions(
    user: AuthUser | unknown,
    permissions: Permission[],
    options: PermissionCheckOptions = {}
): boolean {
    const { allowSuperAdmin = true } = options

    if (allowSuperAdmin && isSuperAdmin(user)) {
        return true
    }

    const userPermissions = getUserPermissions(user)
    return permissions.every(p => userPermissions.includes(p))
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(
    user: AuthUser | unknown,
    permissions: Permission[],
    options: PermissionCheckOptions = {}
): boolean {
    const { allowSuperAdmin = true } = options

    if (allowSuperAdmin && isSuperAdmin(user)) {
        return true
    }

    const userPermissions = getUserPermissions(user)
    return permissions.some(p => userPermissions.includes(p))
}

/**
 * Verifica permisos y retorna resultado detallado
 */
export function checkPermissions(
    user: AuthUser | unknown,
    requiredPermissions: Permission[],
    options: PermissionCheckOptions = {}
): PermissionCheckResult {
    const { requireAll = true, allowSuperAdmin = true } = options

    // Si no hay permisos requeridos, permitir acceso
    if (requiredPermissions.length === 0) {
        return { allowed: true }
    }

    // SUPERADMIN siempre pasa
    if (allowSuperAdmin && isSuperAdmin(user)) {
        return { allowed: true, reason: 'User is SUPERADMIN' }
    }

    const userPermissions = getUserPermissions(user)

    if (requireAll) {
        const missing = requiredPermissions.filter(p => !userPermissions.includes(p))
        if (missing.length > 0) {
            return {
                allowed: false,
                reason: 'Missing required permissions',
                missingPermissions: missing,
            }
        }
    } else {
        const hasAtLeastOne = requiredPermissions.some(p => userPermissions.includes(p))
        if (!hasAtLeastOne) {
            return {
                allowed: false,
                reason: 'Does not have any of the required permissions',
                missingPermissions: requiredPermissions,
            }
        }
    }

    return { allowed: true }
}

/**
 * Crea un usuario normalizado desde datos del backend
 */
export function createAuthUser(userData: unknown): AuthUser | null {
    if (!userData || typeof userData !== 'object') return null

    const u = userData as Record<string, unknown>

    // DEBUG: Ver datos que llegan
    console.log('🔍 createAuthUser - userData:', userData)

    const role = extractUserRole(userData)

    // DEBUG: Ver rol extraído
    console.log('🔍 createAuthUser - extracted role:', role)

    if (!role) {
        console.warn('⚠️ createAuthUser - No se pudo extraer el rol del usuario:', userData)
        return null
    }

    const authUser = {
        id: (u.id ?? u.userId ?? u.user_id ?? '') as string | number,
        email: (u.email ?? '') as string,
        userName: (u.userName ?? u.username ?? u.name ?? '') as string,
        role,
        coredeckRole: getCoredeckRole(role),
        coredeckRoleLabel: getCoredeckRoleLabel(role),
        permissions: getUserPermissions({ role } as AuthUser),
        isSuperAdmin: role === Role.SUPERADMIN,
    }

    // DEBUG: Ver usuario final
    console.log('✅ createAuthUser - authUser final:', authUser)

    return authUser
}

/**
 * Exportar funciones principales
 */
export const RBAC = {
    roleIdToRole,
    normalizeRole,
    extractUserRole,
    getUserPermissions,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    checkPermissions,
    createAuthUser,
}

export default RBAC
