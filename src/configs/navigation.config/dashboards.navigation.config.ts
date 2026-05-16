import { DASHBOARDS_PREFIX_PATH, CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
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
        key: 'concepts.ai',
        path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
        title: 'AI',
        translateKey: 'nav.conceptsAi.ai',
        icon: 'ai',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsAi.aiDesc',
                label: 'AI tools and resources',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.customers',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
        title: 'Users',
        translateKey: 'nav.conceptsCustomers.customers',
        icon: 'customers',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsCustomers.customersDesc',
                label: 'User management',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.accesses',
        path: `${CONCEPTS_PREFIX_PATH}/accesses/access-list`,
        title: 'Accesos',
        translateKey: 'nav.conceptsAccesses.accesses',
        icon: 'signIn',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsAccesses.accessesDesc',
                label: 'Gestión de accesos',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.news',
        path: `${CONCEPTS_PREFIX_PATH}/news/manage-article`,
        title: 'Noticias',
        translateKey: 'nav.conceptsHelpCenter.helpCenter',
        icon: 'helpCeterArticle',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsHelpCenter.helpCenterDesc',
                label: 'Support and articles',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.incidents.list',
        path: `${CONCEPTS_PREFIX_PATH}/incidents`,
        title: 'Reporte de problemas',
        translateKey: 'nav.conceptsProjects.projects',
        icon: 'uiFeedbackAlert',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsProjects.projectTasksDesc',
                label: 'Manage project tasks',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.entries',
        path: `${CONCEPTS_PREFIX_PATH}/entries/entry-list`,
        title: 'Entradas(Pronto) ',
        translateKey: 'nav.entries',
        icon: 'uiFormsFormControl',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.entriesDesc',
                label: 'Entry control and management at the gate',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.mailbox',
        path: `${CONCEPTS_PREFIX_PATH}/mailbox/mailbox-list`,
        title: 'Casilla',
        translateKey: 'nav.mailbox',
        icon: 'products',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.mailboxDesc',
                label: 'Incoming parcels and mail',
            },
        },
        subMenu: [
            {
                key: 'concepts.mailbox.details',
                path: `${CONCEPTS_PREFIX_PATH}/mailbox/mailbox-details/:id`,
                title: 'Mailbox Details',
                translateKey: 'nav.mailboxDetails',
                icon: 'orders',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
                meta: {
                    description: {
                        translateKey: 'nav.mailboxDetailsDesc',
                        label: 'Mailbox entry details',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'concepts.invitations',
        path: `${CONCEPTS_PREFIX_PATH}/invitations/invitations-list`,
        title: 'Invitaciones',
        translateKey: 'nav.invitations',
        icon: 'invitations',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.invitationsDesc',
                label: 'Gestión de invitaciones',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.perks',
        path: `${CONCEPTS_PREFIX_PATH}/perks/perks-list`,
        title: 'Perks',
        translateKey: 'nav.perks',
        icon: 'uiDataDisplayTag',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.perksDesc',
                label: 'Manage company perks',
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
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.logbookDesc',
                label: 'Registro de novedades y eventos',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.workspaces',
        path: `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-list`,
        title: 'Workspaces',
        translateKey: 'nav.workspaces',
        icon: 'landing',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.workspacesDesc',
                label: 'Gestión de workspaces',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.residents',
        path: `${CONCEPTS_PREFIX_PATH}/residents/residents-list`,
        title: 'Residentes',
        translateKey: 'nav.residents',
        icon: 'residentsIcon',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER, SUBADMIN, SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.residentsDesc',
                label: 'Gestiona residentes y sus unidades',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.products',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
        title: 'Products',
        translateKey: 'nav.conceptsProducts.products',
        icon: 'calendar',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.conceptsProducts.productsDesc',
                label: 'Product inventory management',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.marketplace',
        path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-list`,
        title: 'Marketplace',
        translateKey: 'nav.marketplace',
        icon: 'marketplaceIcon',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.marketplaceDesc',
                label: 'View and manage marketplace items',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.plan',
        path: `${CONCEPTS_PREFIX_PATH}/account/pricing`,
        title: 'Plan',
        translateKey: 'nav.plan',
        icon: 'accountPricing',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.planDesc',
                label: 'View and manage your subscription plan',
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
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.chatDesc',
                label: 'Chat with friends',
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
        authority: [SUPERADMIN],
        meta: {
            description: {
                translateKey: 'nav.calendarDesc',
                label: 'Schedule and events',
            },
        },
        subMenu: [],
    },
]

export default dashboardsNavigationConfig
