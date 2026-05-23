export const SUPERADMIN = 'SUPERADMIN'
export const ADMIN = 'ADMIN'
export const OPERATOR = 'OPERATOR'
export const CLIENT = 'CLIENT'

export const ADMIN_GROUP = [ADMIN, OPERATOR] as const
export const ALL_ROLES = [SUPERADMIN, ADMIN, OPERATOR, CLIENT] as const

export type Role =
    | typeof SUPERADMIN
    | typeof ADMIN
    | typeof OPERATOR
    | typeof CLIENT

export type AdminGroupRole = (typeof ADMIN_GROUP)[number]

export const isAdminGroupRole = (role: string): boolean =>
    ADMIN_GROUP.includes(role.toUpperCase() as AdminGroupRole)

export const isSuperAdmin = (role: string): boolean =>
    role?.toUpperCase() === SUPERADMIN
