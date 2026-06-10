import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import { Role, Permission } from '@/utils/rbac/types'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        title: 'Panel',
        translateKey: 'nav.dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_DASHBOARD],
        subMenu: [],
    },
    {
        key: 'companies',
        path: '/companies',
        title: 'Empresas',
        translateKey: 'nav.companies',
        icon: 'building',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_COMPANIES],
        meta: {
            description: {
                translateKey: 'nav.companiesDesc',
                label: 'Empresas y subempresas',
            },
        },
        subMenu: [],
    },
    {
        key: 'users',
        path: '/users',
        title: 'Usuarios',
        translateKey: 'nav.users',
        icon: 'users',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_USERS],
        meta: {
            description: {
                translateKey: 'nav.usersDesc',
                label: 'Gestión de usuarios y roles',
            },
        },
        subMenu: [],
    },
    {
        key: 'locations',
        path: '/buildings',
        title: 'Edificios',
        translateKey: 'nav.locations',
        icon: 'buildings',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
        meta: {
            description: {
                translateKey: 'nav.locationsDesc',
                label: 'Sedes y edificios',
            },
        },
        subMenu: [],
    },
    {
        key: 'accessManagement',
        path: '/access',
        title: 'Control de accesos',
        translateKey: 'nav.accessManagement',
        icon: 'access',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_ACCESS_MANAGEMENT],
        meta: {
            description: {
                translateKey: 'nav.accessManagementDesc',
                label: 'Listas de acceso y registros',
            },
        },
        subMenu: [],
    },
    {
        key: 'documents',
        path: '/documents',
        title: 'Documentos',
        translateKey: 'nav.documents',
        icon: 'documents',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_DOCUMENTS],
        meta: {
            description: {
                translateKey: 'nav.documentsDesc',
                label: 'Archivos de empresas y ubicaciones',
            },
        },
        subMenu: [],
    },
    {
        key: 'auditLog',
        path: '/audit',
        title: 'Auditoría',
        translateKey: 'nav.auditLog',
        icon: 'audit',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_AUDIT_LOG],
        meta: {
            description: {
                translateKey: 'nav.auditLogDesc',
                label: 'Actividad de seguridad y sistema',
            },
        },
        subMenu: [],
    },
    {
        key: 'logbook',
        path: '/logbook',
        title: 'Libro de novedades',
        translateKey: 'nav.logbook',
        icon: 'logbook',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATION_LOGBOOK],
        meta: {
            description: {
                translateKey: 'nav.logbookDesc',
                label: 'Novedades del edificio',
            },
        },
        subMenu: [],
    },
    {
        key: 'tickets',
        path: '/tickets',
        title: 'Tickets',
        translateKey: 'nav.tickets',
        icon: 'tickets',
        type: NAV_ITEM_TYPE_ITEM,
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.CLIENT],
        permissions: [Permission.VIEW_SUPPORT_TICKETS],
        meta: {
            description: {
                translateKey: 'nav.ticketsDesc',
                label: 'Soporte y solicitudes',
            },
        },
        subMenu: [],
    },
]

export default dashboardsNavigationConfig
