import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import { ADMIN, CLIENT, OPERATOR, SUPERADMIN } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        title: 'Dashboard',
        translateKey: 'nav.dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, CLIENT],
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
        subMenu: [],
    },
]

export default dashboardsNavigationConfig
