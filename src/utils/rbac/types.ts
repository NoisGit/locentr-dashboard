// src/utils/rbac/types.ts

export const ROLE_IDS = {
    SUPERADMIN: 1,
    ADMIN: 2,
    SUBADMIN: 6,
} as const

/**
 * Roles del sistema
 * Solo 3 roles están en uso en esta aplicación
 */
export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    ADMIN = 'ADMIN',
    SUBADMIN = 'SUBADMIN',
}

/**
 * Permisos granulares del sistema
 * Cada permiso representa una acción específica
 */
export enum Permission {
    // Dashboard
    VIEW_DASHBOARD = 'view:dashboard',

    // Users
    VIEW_USERS = 'view:users',
    CREATE_USER = 'create:user',
    EDIT_USER = 'edit:user',
    DELETE_USER = 'delete:user',

    // Communities
    VIEW_COMMUNITIES = 'view:communities',
    CREATE_COMMUNITY = 'create:community',
    EDIT_COMMUNITY = 'edit:community',
    DELETE_COMMUNITY = 'delete:community',

    // Condos
    VIEW_CONDOS = 'view:condos',
    CREATE_CONDO = 'create:condo',
    EDIT_CONDO = 'edit:condo',
    DELETE_CONDO = 'delete:condo',

    // Properties
    VIEW_PROPERTIES = 'view:properties',
    CREATE_PROPERTY = 'create:property',
    EDIT_PROPERTY = 'edit:property',
    DELETE_PROPERTY = 'delete:property',

    // Residents
    VIEW_RESIDENTS = 'view:residents',
    CREATE_RESIDENT = 'create:resident',
    EDIT_RESIDENT = 'edit:resident',
    DELETE_RESIDENT = 'delete:resident',

    // Access Control
    VIEW_ACCESS = 'view:access',
    CREATE_ACCESS = 'create:access',
    EDIT_ACCESS = 'edit:access',
    DELETE_ACCESS = 'delete:access',

    // Invitations
    VIEW_INVITATIONS = 'view:invitations',
    CREATE_INVITATION = 'create:invitation',
    EDIT_INVITATION = 'edit:invitation',
    DELETE_INVITATION = 'delete:invitation',

    // Incidents
    VIEW_INCIDENTS = 'view:incidents',
    CREATE_INCIDENT = 'create:incident',
    EDIT_INCIDENT = 'edit:incident',
    DELETE_INCIDENT = 'delete:incident',

    // News
    VIEW_NEWS = 'view:news',
    CREATE_NEWS = 'create:news',
    EDIT_NEWS = 'edit:news',
    DELETE_NEWS = 'delete:news',

    // Marketplace
    VIEW_MARKETPLACE = 'view:marketplace',
    CREATE_MARKETPLACE = 'create:marketplace',
    EDIT_MARKETPLACE = 'edit:marketplace',
    DELETE_MARKETPLACE = 'delete:marketplace',

    // Perks
    VIEW_PERKS = 'view:perks',
    CREATE_PERK = 'create:perk',
    EDIT_PERK = 'edit:perk',
    DELETE_PERK = 'delete:perk',

    // Roles & Permissions
    VIEW_ROLES = 'view:roles',
    EDIT_ROLES = 'edit:roles',

    // Settings
    VIEW_SETTINGS = 'view:settings',
    EDIT_SETTINGS = 'edit:settings',

    // AI
    USE_AI_CHAT = 'use:ai-chat',
}

/**
 * Mapa de roles a permisos
 * Define qué permisos tiene cada rol
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.SUPERADMIN]: [
        // SUPERADMIN tiene TODOS los permisos
        ...Object.values(Permission),
    ],

    [Role.ADMIN]: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.EDIT_USER,
        Permission.DELETE_USER,
        Permission.VIEW_COMMUNITIES,
        Permission.VIEW_CONDOS,
        Permission.VIEW_PROPERTIES,
        Permission.EDIT_PROPERTY,
        Permission.VIEW_RESIDENTS,
        Permission.CREATE_RESIDENT,
        Permission.EDIT_RESIDENT,
        Permission.VIEW_ACCESS,
        Permission.CREATE_ACCESS,
        Permission.VIEW_INVITATIONS,
        Permission.CREATE_INVITATION,
        Permission.EDIT_INVITATION,
        Permission.VIEW_INCIDENTS,
        Permission.CREATE_INCIDENT,
        Permission.EDIT_INCIDENT,
        Permission.VIEW_NEWS,
        Permission.CREATE_NEWS,
        Permission.EDIT_NEWS,
        Permission.DELETE_NEWS,
        Permission.VIEW_SETTINGS,
        Permission.EDIT_SETTINGS,
    ],

    [Role.SUBADMIN]: [
        // SUBADMIN: Solo lectura en condos, puede gestionar residentes, accesos, invitaciones, incidentes, noticias
        Permission.VIEW_CONDOS,
        Permission.VIEW_PROPERTIES,
        Permission.VIEW_RESIDENTS,
        Permission.CREATE_RESIDENT,
        Permission.EDIT_RESIDENT,
        Permission.VIEW_ACCESS,
        Permission.CREATE_ACCESS,
        Permission.VIEW_INVITATIONS,
        Permission.CREATE_INVITATION,
        Permission.VIEW_INCIDENTS,
        Permission.CREATE_INCIDENT,
        Permission.VIEW_NEWS,
        Permission.CREATE_NEWS,
        Permission.VIEW_SETTINGS,
    ],
}

/**
 * Usuario con información de autorización
 */
export interface AuthUser {
    id: string | number
    email: string
    userName?: string
    role: Role
    coredeckRole?: string | null
    coredeckRoleLabel?: string
    permissions?: Permission[]
    isSuperAdmin?: boolean
}

/**
 * Opciones para validación de permisos
 */
export interface PermissionCheckOptions {
    requireAll?: boolean // Si true, requiere TODOS los permisos. Si false, al menos uno
    allowSuperAdmin?: boolean // Si true, SUPERADMIN siempre pasa (default: true)
}

/**
 * Resultado de validación de permisos
 */
export interface PermissionCheckResult {
    allowed: boolean
    reason?: string
    missingPermissions?: Permission[]
}
