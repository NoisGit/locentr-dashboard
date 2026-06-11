export const ROLE_IDS = {
    SUPERADMIN: 1,
    ADMIN: 2,
    OPERATOR: 3,
    CLIENT: 4,
} as const

export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    OPERATOR = 'OPERATOR',
    CLIENT = 'CLIENT',
}

export enum Permission {
    VIEW_DASHBOARD = 'view:dashboard',

    VIEW_COMPANIES = 'view:companies',
    CREATE_COMPANY = 'create:company',
    EDIT_COMPANY = 'edit:company',
    DEACTIVATE_COMPANY = 'deactivate:company',

    VIEW_USERS = 'view:users',
    CREATE_USER = 'create:user',
    EDIT_USER = 'edit:user',
    DEACTIVATE_USER = 'deactivate:user',

    VIEW_LOCATIONS = 'view:locations',
    CREATE_LOCATION = 'create:location',
    EDIT_LOCATION = 'edit:location',
    DEACTIVATE_LOCATION = 'deactivate:location',

    VIEW_ACCESS_MANAGEMENT = 'view:access-management',
    CREATE_ACCESS_ENTRY = 'create:access-entry',
    EDIT_ACCESS_ENTRY = 'edit:access-entry',
    REVOKE_ACCESS_ENTRY = 'revoke:access-entry',
    VIEW_ACCESS_LOGS = 'view:access-logs',
    CREATE_ACCESS_LOG = 'create:access-log',
    REGISTER_ACCESS_EXIT = 'register:access-exit',

    VIEW_SUPPORT_TICKETS = 'view:support-tickets',
    CREATE_SUPPORT_TICKET = 'create:support-ticket',
    EDIT_SUPPORT_TICKET = 'edit:support-ticket',

    VIEW_DOCUMENTS = 'view:documents',
    CREATE_DOCUMENT = 'create:document',
    ARCHIVE_DOCUMENT = 'archive:document',

    VIEW_NOTIFICATIONS = 'view:notifications',
    SEND_NOTIFICATION = 'send:notification',

    VIEW_AUDIT_LOG = 'view:audit-log',
    VIEW_CONTACTS = 'view:contacts',
    VIEW_LOCATION_LOGBOOK = 'view:location-logbook',
    VIEW_SYSTEM = 'view:system',
    VIEW_SETTINGS = 'view:settings',
    EDIT_SETTINGS = 'edit:settings',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.SUPERADMIN]: [...Object.values(Permission)],

    [Role.ADMIN]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_COMPANIES,
        Permission.CREATE_COMPANY,
        Permission.EDIT_COMPANY,
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.EDIT_USER,
        Permission.VIEW_LOCATIONS,
        Permission.CREATE_LOCATION,
        Permission.EDIT_LOCATION,
        Permission.DEACTIVATE_LOCATION,
        Permission.VIEW_ACCESS_MANAGEMENT,
        Permission.CREATE_ACCESS_ENTRY,
        Permission.EDIT_ACCESS_ENTRY,
        Permission.REVOKE_ACCESS_ENTRY,
        Permission.VIEW_ACCESS_LOGS,
        Permission.REGISTER_ACCESS_EXIT,
        Permission.VIEW_SUPPORT_TICKETS,
        Permission.EDIT_SUPPORT_TICKET,
        Permission.VIEW_DOCUMENTS,
        Permission.VIEW_NOTIFICATIONS,
        Permission.SEND_NOTIFICATION,
        Permission.VIEW_CONTACTS,
        Permission.VIEW_LOCATION_LOGBOOK,
        Permission.VIEW_SETTINGS,
        Permission.EDIT_SETTINGS,
    ],

    [Role.OPERATOR]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_LOCATIONS,
        Permission.CREATE_ACCESS_LOG,
        Permission.REGISTER_ACCESS_EXIT,
        Permission.VIEW_LOCATION_LOGBOOK,
        Permission.VIEW_NOTIFICATIONS,
    ],

    [Role.CLIENT]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_LOCATIONS,
        Permission.VIEW_ACCESS_MANAGEMENT,
        Permission.CREATE_ACCESS_ENTRY,
        Permission.REVOKE_ACCESS_ENTRY,
        Permission.VIEW_ACCESS_LOGS,
        Permission.VIEW_LOCATION_LOGBOOK,
        Permission.VIEW_NOTIFICATIONS,
    ],
}

export interface AuthUser {
    id: string | number
    email: string
    userName?: string
    role: Role
    locentrRole?: string | null
    locentrRoleLabel?: string
    permissions?: Permission[]
    isSuperAdmin?: boolean
}

export interface PermissionCheckOptions {
    requireAll?: boolean
    allowSuperAdmin?: boolean
}

export interface PermissionCheckResult {
    allowed: boolean
    reason?: string
    missingPermissions?: Permission[]
}
