// src/utils/rbac/migrateRoutes.ts
/**
 * Utilidad para migrar rutas del sistema antiguo (authority) al nuevo sistema RBAC
 * 
 * Este archivo convierte authority strings a Roles y asigna permisos automáticamente
 * basándose en el path de la ruta.
 */

import { Role, Permission } from './types'
import type { Route } from '@/@types/routes'

/**
 * Mapeo de authority strings a Roles RBAC
 */
const AUTHORITY_TO_ROLE: Record<string, Role> = {
    superadmin: Role.SUPERADMIN,
    SUPERADMIN: Role.SUPERADMIN,
    administrador: Role.ADMIN,
    admin: Role.ADMIN,
    ADMIN: Role.ADMIN,
    subadministrador: Role.SUBADMIN,
    subadmin: Role.SUBADMIN,
    SUBADMIN: Role.SUBADMIN,
}

/**
 * Infiere permisos basados en la ruta y acción
 */
function inferPermissionsFromPath(path: string): Permission[] {
    const permissions: Permission[] = []

    // Dashboard
    if (path.includes('/dashboards')) {
        permissions.push(Permission.VIEW_DASHBOARD)
    }

    // AI
    if (path.includes('/ai/')) {
        permissions.push(Permission.USE_AI_CHAT)
    }

    // Users
    if (path.includes('/users/')) {
        permissions.push(Permission.VIEW_USERS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_USER)
        if (path.includes('-create')) permissions.push(Permission.CREATE_USER)
        if (path.includes('-details')) permissions.push(Permission.VIEW_USERS)
    }

    // Access
    if (path.includes('/accesses/')) {
        permissions.push(Permission.VIEW_ACCESS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_ACCESS)
        if (path.includes('-create')) permissions.push(Permission.CREATE_ACCESS)
    }

    // Communities
    if (path.includes('/communities/')) {
        permissions.push(Permission.VIEW_COMMUNITIES)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_COMMUNITY)
        if (path.includes('-create')) permissions.push(Permission.CREATE_COMMUNITY)
        if (path.includes('-details')) permissions.push(Permission.VIEW_COMMUNITIES)
    }

    // Condos
    if (path.includes('/condos/')) {
        permissions.push(Permission.VIEW_CONDOS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_CONDO)
        if (path.includes('-create')) permissions.push(Permission.CREATE_CONDO)
        if (path.includes('-details')) permissions.push(Permission.VIEW_CONDOS)
    }

    // Properties
    if (path.includes('/properties/')) {
        permissions.push(Permission.VIEW_PROPERTIES)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_PROPERTY)
        if (path.includes('-create')) permissions.push(Permission.CREATE_PROPERTY)
        if (path.includes('-details')) permissions.push(Permission.VIEW_PROPERTIES)
    }

    // Residents
    if (path.includes('/residents/')) {
        permissions.push(Permission.VIEW_RESIDENTS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_RESIDENT)
        if (path.includes('-create')) permissions.push(Permission.CREATE_RESIDENT)
        if (path.includes('-details')) permissions.push(Permission.VIEW_RESIDENTS)
    }

    // Invitations
    if (path.includes('/invitations/')) {
        permissions.push(Permission.VIEW_INVITATIONS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_INVITATION)
        if (path.includes('-create')) permissions.push(Permission.CREATE_INVITATION)
    }

    // Incidents
    if (path.includes('/incidents/')) {
        permissions.push(Permission.VIEW_INCIDENTS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_INCIDENT)
        if (path.includes('-create')) permissions.push(Permission.CREATE_INCIDENT)
        if (path.includes('-details')) permissions.push(Permission.VIEW_INCIDENTS)
    }

    // News
    if (path.includes('/news/')) {
        permissions.push(Permission.VIEW_NEWS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_NEWS)
        if (path.includes('-create')) permissions.push(Permission.CREATE_NEWS)
        if (path.includes('-details')) permissions.push(Permission.VIEW_NEWS)
    }

    // Marketplace
    if (path.includes('/marketplace/')) {
        permissions.push(Permission.VIEW_MARKETPLACE)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_MARKETPLACE)
        if (path.includes('-create')) permissions.push(Permission.CREATE_MARKETPLACE)
        if (path.includes('-details')) permissions.push(Permission.VIEW_MARKETPLACE)
    }

    // Perks
    if (path.includes('/perks/')) {
        permissions.push(Permission.VIEW_PERKS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_PERK)
        if (path.includes('-create')) permissions.push(Permission.CREATE_PERK)
        if (path.includes('-details')) permissions.push(Permission.VIEW_PERKS)
    }

    // Settings
    if (path.includes('/settings/')) {
        permissions.push(Permission.VIEW_SETTINGS)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_SETTINGS)
    }

    // Roles
    if (path.includes('/roles/')) {
        permissions.push(Permission.VIEW_ROLES)
        if (path.includes('-edit')) permissions.push(Permission.EDIT_ROLES)
    }

    return [...new Set(permissions)] // Remove duplicates
}

/**
 * Migra una ruta del sistema antiguo al nuevo sistema RBAC
 */
export function migrateRoute(route: Route): Route {
    // Si ya tiene roles y permissions, no migrar
    if (route.roles && route.permissions) {
        return route
    }

    const migratedRoute = { ...route }

    // Convertir authority a roles
    if (route.authority && route.authority.length > 0) {
        migratedRoute.roles = route.authority
            .map((auth) => AUTHORITY_TO_ROLE[auth])
            .filter(Boolean) as Role[]
    }

    // Inferir permisos basados en el path si no tiene permisos
    if (!migratedRoute.permissions) {
        migratedRoute.permissions = inferPermissionsFromPath(route.path)
    }

    // Si no pudo inferir permisos y tiene roles, dar permisos mínimos de visualización
    if (migratedRoute.permissions.length === 0 && migratedRoute.roles) {
        // Dar permiso de dashboard por defecto si no se pudo inferir nada
        migratedRoute.permissions = [Permission.VIEW_DASHBOARD]
    }

    return migratedRoute
}

/**
 * Migra un array de rutas
 */
export function migrateRoutes(routes: Route[]): Route[] {
    return routes.map(migrateRoute)
}

/**
 * Valida que una ruta tenga configuración RBAC correcta
 */
export function validateRoute(route: Route): {
    valid: boolean
    warnings: string[]
} {
    const warnings: string[] = []

    // Advertir si usa authority (deprecated)
    if (route.authority && route.authority.length > 0) {
        warnings.push(`Route "${route.key}" uses deprecated "authority" field. Use "roles" instead.`)
    }

    // Advertir si no tiene roles ni permissions
    if (!route.roles && !route.permissions) {
        warnings.push(
            `Route "${route.key}" has no roles or permissions defined. It will be accessible to all authenticated users.`
        )
    }

    // Advertir si tiene roles pero no permissions
    if (route.roles && route.roles.length > 0 && (!route.permissions || route.permissions.length === 0)) {
        warnings.push(
            `Route "${route.key}" has roles but no permissions. Consider adding specific permissions for better security.`
        )
    }

    return {
        valid: warnings.length === 0,
        warnings,
    }
}

// Flag para mostrar advertencias solo una vez
let warningsShown = false

/**
 * Valida un array de rutas e imprime advertencias en consola
 */
export function validateRoutes(routes: Route[]): void {
    // Mostrar advertencias solo una vez
    if (warningsShown) return
    warningsShown = true

    const allWarnings: string[] = []

    routes.forEach((route) => {
        const { warnings } = validateRoute(route)
        allWarnings.push(...warnings)
    })

    if (allWarnings.length > 0) {
        console.groupCollapsed(
            `⚠️  ${allWarnings.length} route(s) using deprecated "authority" field (auto-migrated)`
        )
        console.log('These routes are automatically migrated to use RBAC roles + permissions.')
        console.log('The app works fine, but consider updating manually for cleaner code.')
        console.log('\nRoutes using deprecated "authority":')
        allWarnings.forEach((warning) => {
            console.log(`  - ${warning}`)
        })
        console.log('\nSee MIGRATION_GUIDE.md for details.')
        console.groupEnd()
    } else {
        console.log('✅ All routes have valid RBAC configuration')
    }
}
