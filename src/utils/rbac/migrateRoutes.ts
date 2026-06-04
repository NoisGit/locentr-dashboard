import { Role, Permission } from './types'
import type { Route } from '@/@types/routes'

const AUTHORITY_TO_ROLE: Record<string, Role> = {
    SUPERADMIN: Role.SUPERADMIN,
    superadmin: Role.SUPERADMIN,
    ADMIN: Role.ADMIN,
    admin: Role.ADMIN,
    OPERATOR: Role.OPERATOR,
    operator: Role.OPERATOR,
    CLIENT: Role.CLIENT,
    client: Role.CLIENT,
}

function inferPermissionsFromPath(path: string): Permission[] {
    if (path.startsWith('/dashboard')) return [Permission.VIEW_DASHBOARD]
    if (path.startsWith('/companies')) return [Permission.VIEW_COMPANIES]
    if (path.startsWith('/locations')) return [Permission.VIEW_LOCATIONS]
    if (path.startsWith('/access-management')) return [Permission.VIEW_ACCESS_MANAGEMENT]
    if (path.startsWith('/support-tickets')) return [Permission.VIEW_SUPPORT_TICKETS]
    if (path.startsWith('/documents')) return [Permission.VIEW_DOCUMENTS]
    if (path.startsWith('/notifications')) return [Permission.VIEW_NOTIFICATIONS]
    if (path.startsWith('/audit-log')) return [Permission.VIEW_AUDIT_LOG]

    return []
}

export function migrateRoute(route: Route): Route {
    if (route.roles && route.permissions) return route

    const migratedRoute = { ...route }

    if (route.authority && route.authority.length > 0) {
        migratedRoute.roles = route.authority
            .map((auth) => AUTHORITY_TO_ROLE[auth])
            .filter(Boolean) as Role[]
    }

    if (!migratedRoute.permissions) {
        migratedRoute.permissions = inferPermissionsFromPath(route.path)
    }

    if (migratedRoute.permissions.length === 0 && migratedRoute.roles) {
        migratedRoute.permissions = [Permission.VIEW_DASHBOARD]
    }

    return migratedRoute
}

export function migrateRoutes(routes: Route[]): Route[] {
    return routes.map(migrateRoute)
}

export function validateRoute(route: Route): { valid: boolean; warnings: string[] } {
    const warnings: string[] = []

    if (route.authority && route.authority.length > 0) {
        warnings.push(`Route "${route.key}" uses deprecated "authority" field. Use "roles" instead.`)
    }

    if (!route.roles && !route.permissions) {
        warnings.push(`Route "${route.key}" has no roles or permissions defined.`)
    }

    return {
        valid: warnings.length === 0,
        warnings,
    }
}

let warningsShown = false

export function validateRoutes(routes: Route[]): void {
    if (warningsShown) return
    warningsShown = true

    const allWarnings = routes.flatMap((route) => validateRoute(route).warnings)

    if (allWarnings.length > 0) {
        console.groupCollapsed(`${allWarnings.length} route RBAC warning(s)`)
        allWarnings.forEach((warning) => console.warn(warning))
        console.groupEnd()
    }
}
