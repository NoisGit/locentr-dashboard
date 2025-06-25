import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const conceptsNavigationConfig: NavigationTree[] = [
    {
        key: 'concepts.account',
        path: '',
        title: 'Account',
        translateKey: 'nav.conceptsAccount.account',
        icon: 'account',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsAccount.accountDesc',
                label: 'Account settings and info',
            },
        },
        subMenu: [
            {
                key: 'concepts.account.settings',
                path: `${CONCEPTS_PREFIX_PATH}/account/settings`,
                title: 'Settings',
                translateKey: 'nav.conceptsAccount.settings',
                icon: 'accountSettings',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccount.settingsDesc',
                        label: 'Configure your settings',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.account.activityLog',
                path: `${CONCEPTS_PREFIX_PATH}/account/activity-log`,
                title: 'Activity log',
                translateKey: 'nav.conceptsAccount.activityLog',
                icon: 'accountActivityLogs',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccount.activityLogDesc',
                        label: 'View recent activities',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.account.rolesPermissions',
                path: `${CONCEPTS_PREFIX_PATH}/account/roles-permissions`,
                title: 'Roles & Permissions',
                translateKey: 'nav.conceptsAccount.rolesPermissions',
                icon: 'accountRoleAndPermission',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccount.rolesPermissionsDesc',
                        label: 'Manage roles & permissions',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.account.pricing',
                path: `${CONCEPTS_PREFIX_PATH}/account/pricing`,
                title: 'Pricing',
                translateKey: 'nav.conceptsAccount.pricing',
                icon: 'accountPricing',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAccount.pricingDesc',
                        label: 'View pricing plans',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'concepts.marketplace',
        path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-list`,
        title: 'Marketplace',
        translateKey: 'nav.marketplace',
        icon: 'orders',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.marketplaceDesc',
                label: 'View and manage marketplace items',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.logbook',
        path: `${CONCEPTS_PREFIX_PATH}/logbook/logbook-list`,
        title: 'Libro de Novedades',
        translateKey: 'nav.logbook',
        icon: 'documentation',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.logbookDesc',
                label: 'Registro de novedades y eventos',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.calendar',
        path: `${CONCEPTS_PREFIX_PATH}/calendar`,
        title: 'Calendar',
        translateKey: 'nav.calendar',
        icon: 'calendar',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.calendarDesc',
                label: 'Schedule and events',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.chat',
        path: `${CONCEPTS_PREFIX_PATH}/chat`,
        title: 'Chat',
        translateKey: 'nav.chat',
        icon: 'chat',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.chatDesc',
                label: 'Chat with friends',
            },
        },
        subMenu: [],
    },
]

export default conceptsNavigationConfig
