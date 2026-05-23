import { Role } from './types'

export enum CoredeckRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export const COREDECK_ROLE_LABELS: Record<CoredeckRole, string> = {
    [CoredeckRole.OWNER]: 'Owner',
    [CoredeckRole.ADMIN]: 'Admin',
    [CoredeckRole.MEMBER]: 'Member',
    [CoredeckRole.VIEWER]: 'Viewer',
}

const API_ROLE_ALIASES: Record<string, CoredeckRole> = {
    [Role.SUPERADMIN]: CoredeckRole.OWNER,
    [Role.ADMIN]: CoredeckRole.ADMIN,
    [Role.OPERATOR]: CoredeckRole.MEMBER,
    [Role.CLIENT]: CoredeckRole.VIEWER,
    OWNER: CoredeckRole.OWNER,
    MEMBER: CoredeckRole.MEMBER,
    VIEWER: CoredeckRole.VIEWER,
}

function normalizeRoleValue(role: unknown): string {
    if (typeof role !== 'string') return ''
    return role.trim().toUpperCase().replace(/[-\s]/g, '_')
}

export function getCoredeckRole(role: unknown): CoredeckRole | null {
    const normalized = normalizeRoleValue(role)
    if (!normalized) return null
    return API_ROLE_ALIASES[normalized] ?? null
}

export function getCoredeckRoleLabel(role: unknown): string {
    const coredeckRole = getCoredeckRole(role)
    if (!coredeckRole) return ''
    return COREDECK_ROLE_LABELS[coredeckRole]
}
