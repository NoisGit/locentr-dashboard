import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import { ADMIN, USER, SUBADMIN, SUPERADMIN } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        title: 'Dashboard',
        translateKey: 'nav.dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        subMenu: [],
    },
    {
        key: 'users',
        path: '/users',
        title: 'Users',
        translateKey: 'nav.users',
        icon: 'customers',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.usersDesc',
                label: 'User management',
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
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.workspacesDesc',
                label: 'Workspace management',
            },
        },
        subMenu: [],
    },
]

export default dashboardsNavigationConfig
