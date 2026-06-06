import {
    Role,
    Permission,
    AuthUser,
    ROLE_PERMISSIONS,
    PermissionCheckOptions,
    PermissionCheckResult,
    ROLE_IDS,
} from './types'
import { getLocentrRole, getLocentrRoleLabel } from './roleAliases'

export function roleIdToRole(roleId: unknown): Role | null {
    const id = Number(roleId)

    if (Number.isNaN(id)) return null

    if (id === ROLE_IDS.SUPERADMIN) return Role.SUPERADMIN
    if (id === ROLE_IDS.ADMIN) return Role.ADMIN
    if (id === ROLE_IDS.OPERATOR) return Role.OPERATOR
    if (id === ROLE_IDS.CLIENT) return Role.CLIENT

    return null
}

export function normalizeRole(role: unknown): Role | null {
    if (typeof role !== 'string') return null

    const value = role.trim().toUpperCase().replace(/[-_\s]/g, '')

    if (value === 'SUPERADMIN' || value === 'SUPERADMINISTRATOR') return Role.SUPERADMIN
    if (value === 'ADMIN' || value === 'ADMINISTRATOR') return Role.ADMIN
    if (value === 'OPERATOR' || value === 'OPERADOR') return Role.OPERATOR
    if (value === 'CLIENT' || value === 'CUSTOMER') return Role.CLIENT

    return null
}

export function extractUserRole(user: unknown): Role | null {
    if (!user || typeof user !== 'object') return null

    const record = user as Record<string, unknown>

    const roleIdCandidates = [
        record.role_id,
        record.roleId,
        typeof record.role === 'object'
            ? (record.role as Record<string, unknown>).id
            : undefined,
    ]

    for (const roleId of roleIdCandidates) {
        const role = roleIdToRole(roleId)
        if (role) return role
    }

    const roleCandidates = [
        record.role,
        record.userRole,
        record.user_role,
        record.roleType,
        Array.isArray(record.roles) ? record.roles[0] : undefined,
    ]

    for (const candidate of roleCandidates) {
        if (!candidate) continue

        if (typeof candidate === 'object') {
            const roleObject = candidate as Record<string, unknown>
            const roleName = roleObject.name ?? roleObject.role ?? roleObject.code ?? roleObject.key
            const role = normalizeRole(roleName)
            if (role) return role
            continue
        }

        const role = normalizeRole(candidate)
        if (role) return role
    }

    return null
}

export function getUserPermissions(user: AuthUser | unknown): Permission[] {
    if (!user || typeof user !== 'object') return []

    const authUser = user as AuthUser

    if (Array.isArray(authUser.permissions) && authUser.permissions.length > 0) {
        return authUser.permissions
    }

    const role = authUser.role ?? extractUserRole(user)
    if (!role) return []

    return ROLE_PERMISSIONS[role] ?? []
}

export function hasRole(user: AuthUser | unknown, role: Role): boolean {
    const userRole = (user as AuthUser)?.role ?? extractUserRole(user)
    return userRole === role
}

export function hasAnyRole(user: AuthUser | unknown, roles: Role[]): boolean {
    const userRole = (user as AuthUser)?.role ?? extractUserRole(user)
    return userRole ? roles.includes(userRole) : false
}

export function isSuperAdmin(user: AuthUser | unknown): boolean {
    return hasRole(user, Role.SUPERADMIN)
}

export function hasPermission(
    user: AuthUser | unknown,
    permission: Permission,
    options: PermissionCheckOptions = {},
): boolean {
    const { allowSuperAdmin = true } = options

    if (allowSuperAdmin && isSuperAdmin(user)) return true

    return getUserPermissions(user).includes(permission)
}

export function hasAllPermissions(
    user: AuthUser | unknown,
    permissions: Permission[],
    options: PermissionCheckOptions = {},
): boolean {
    const { allowSuperAdmin = true } = options

    if (allowSuperAdmin && isSuperAdmin(user)) return true

    const userPermissions = getUserPermissions(user)
    return permissions.every((permission) => userPermissions.includes(permission))
}

export function hasAnyPermission(
    user: AuthUser | unknown,
    permissions: Permission[],
    options: PermissionCheckOptions = {},
): boolean {
    const { allowSuperAdmin = true } = options

    if (allowSuperAdmin && isSuperAdmin(user)) return true

    const userPermissions = getUserPermissions(user)
    return permissions.some((permission) => userPermissions.includes(permission))
}

export function checkPermissions(
    user: AuthUser | unknown,
    requiredPermissions: Permission[],
    options: PermissionCheckOptions = {},
): PermissionCheckResult {
    const { requireAll = true, allowSuperAdmin = true } = options

    if (requiredPermissions.length === 0) return { allowed: true }

    if (allowSuperAdmin && isSuperAdmin(user)) {
        return { allowed: true, reason: 'User is SUPERADMIN' }
    }

    const userPermissions = getUserPermissions(user)
    const missingPermissions = requiredPermissions.filter(
        (permission) => !userPermissions.includes(permission),
    )

    if (requireAll && missingPermissions.length > 0) {
        return {
            allowed: false,
            reason: 'Missing required permissions',
            missingPermissions,
        }
    }

    if (!requireAll && missingPermissions.length === requiredPermissions.length) {
        return {
            allowed: false,
            reason: 'Does not have any of the required permissions',
            missingPermissions: requiredPermissions,
        }
    }

    return { allowed: true }
}

export function createAuthUser(userData: unknown): AuthUser | null {
    if (!userData || typeof userData !== 'object') return null

    const record = userData as Record<string, unknown>
    const role = extractUserRole(userData)

    if (!role) return null

    return {
        id: (record.id ?? record.userId ?? record.user_id ?? '') as string | number,
        email: (record.email ?? '') as string,
        userName: (record.userName ?? record.username ?? record.name ?? record.full_name ?? '') as string,
        role,
        locentrRole: getLocentrRole(role),
        locentrRoleLabel: getLocentrRoleLabel(role),
        permissions: getUserPermissions({ role } as AuthUser),
        isSuperAdmin: role === Role.SUPERADMIN,
    }
}

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
