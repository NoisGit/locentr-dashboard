import { Role } from './types'

export enum LocentrRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export const LOCENTR_ROLE_LABELS: Record<LocentrRole, string> = {
    [LocentrRole.OWNER]: 'Propietario',
    [LocentrRole.ADMIN]: 'Administrador',
    [LocentrRole.MEMBER]: 'Operador',
    [LocentrRole.VIEWER]: 'Cliente',
}

const API_ROLE_ALIASES: Record<string, LocentrRole> = {
    [Role.SUPERADMIN]: LocentrRole.OWNER,
    [Role.ADMIN]: LocentrRole.ADMIN,
    [Role.OPERATOR]: LocentrRole.MEMBER,
    [Role.CLIENT]: LocentrRole.VIEWER,
    OWNER: LocentrRole.OWNER,
    MEMBER: LocentrRole.MEMBER,
    VIEWER: LocentrRole.VIEWER,
}

function normalizeRoleValue(role: unknown): string {
    if (typeof role !== 'string') return ''
    return role.trim().toUpperCase().replace(/[-\s]/g, '_')
}

export function getLocentrRole(role: unknown): LocentrRole | null {
    const normalized = normalizeRoleValue(role)
    if (!normalized) return null
    return API_ROLE_ALIASES[normalized] ?? null
}

export function getLocentrRoleLabel(role: unknown): string {
    const locentrRole = getLocentrRole(role)
    if (!locentrRole) return ''
    return LOCENTR_ROLE_LABELS[locentrRole]
}
