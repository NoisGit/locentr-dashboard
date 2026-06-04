import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import { ADMIN, CLIENT, OPERATOR, SUPERADMIN } from '@/constants/roles.constant'
import { Role, Permission } from '@/utils/rbac/types'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        title: 'Dashboard',
        translateKey: 'nav.dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_DASHBOARD],
        subMenu: [],
    },
    {
        key: 'companies',
        path: '/companies',
        title: 'Companies',
        translateKey: 'nav.companies',
        icon: 'building',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN],
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_COMPANIES],
        meta: {
            description: {
                translateKey: 'nav.companiesDesc',
                label: 'Companies and subcompanies',
            },
        },
        subMenu: [],
    },
    {
        key: 'accessManagement',
        path: '/access-management',
        title: 'Access Management',
        translateKey: 'nav.accessManagement',
        icon: 'customers',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_ACCESS_MANAGEMENT],
        meta: {
            description: {
                translateKey: 'nav.accessManagementDesc',
                label: 'Users, access lists and access logs',
            },
        },
        subMenu: [],
    },
    {
        key: 'locations',
        path: '/locations',
        title: 'Locations',
        translateKey: 'nav.locations',
        icon: 'landing',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
        meta: {
            description: {
                translateKey: 'nav.locationsDesc',
                label: 'Location management',
            },
        },
        subMenu: [],
    },
    {
        key: 'documents',
        path: '/documents',
        title: 'Documents',
        translateKey: 'nav.documents',
        icon: 'documentation',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_DOCUMENTS],
        meta: {
            description: {
                translateKey: 'nav.documentsDesc',
                label: 'Company files and downloads',
            },
        },
        subMenu: [],
    },
    {
        key: 'notifications',
        path: '/notifications',
        title: 'Notifications',
        translateKey: 'nav.notifications',
        icon: 'notification',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_NOTIFICATIONS],
        meta: {
            description: {
                translateKey: 'nav.notificationsDesc',
                label: 'Unread alerts and broadcasts',
            },
        },
        subMenu: [],
    },
    {
        key: 'auditLog',
        path: '/audit-log',
        title: 'Audit Log',
        translateKey: 'nav.auditLog',
        icon: 'accountActivityLogs',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN],
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_AUDIT_LOG],
        meta: {
            description: {
                translateKey: 'nav.auditLogDesc',
                label: 'Security and system activity',
            },
        },
        subMenu: [],
    },
    {
        key: 'tickets',
        path: '/support-tickets',
        title: 'Tickets',
        translateKey: 'nav.tickets',
        icon: 'documentation',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, CLIENT],
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.CLIENT],
        permissions: [Permission.VIEW_SUPPORT_TICKETS],
        subMenu: [],
    },
]

export default dashboardsNavigationConfig
