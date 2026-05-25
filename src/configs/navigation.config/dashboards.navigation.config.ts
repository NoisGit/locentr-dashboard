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
        key: 'workspaces',
        path: '/workspaces',
        title: 'Workspaces',
        translateKey: 'nav.workspaces',
        icon: 'landing',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        meta: {
            description: {
                translateKey: 'nav.workspacesDesc',
                label: 'Workspace management',
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
