import { DASHBOARDS_PREFIX_PATH, CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM, NAV_ITEM_TYPE_COLLAPSE } from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const dashboardsNavigationConfig: NavigationTree[] = [
    {
        key: 'dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        title: 'Dashboard',
        translateKey: 'nav.dashboard.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
    },
    {
        key: 'concepts.customers',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
        title: 'Users',
        translateKey: 'nav.conceptsCustomers.customers',
        icon: 'customers',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsCustomers.customersDesc',
                label: 'Customer management',
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
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsAccesses.accessesDesc',
                label: 'Gestión de accesos',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.products',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
        title: 'Products',
        translateKey: 'nav.conceptsProducts.products',
        icon: 'products',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsProducts.productsDesc',
                label: 'Product inventory management',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.news',
        path: '',
        title: 'Noticias',
        translateKey: 'nav.conceptsHelpCenter.helpCenter',
        icon: 'helpCenter',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsHelpCenter.helpCenterDesc',
                label: 'Support and articles',
            },
        },
        subMenu: [
            {
                key: 'concepts.news.supportHub',
                path: `${CONCEPTS_PREFIX_PATH}/news/support-hub`,
                title: 'Support Hub',
                translateKey: 'nav.conceptsHelpCenter.supportHub',
                icon: 'helpCeterSupportHub',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsHelpCenter.supportHubDesc',
                        label: 'Central support hub',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.helpCenter.article',
                path: `${CONCEPTS_PREFIX_PATH}/news/article/pWBKE_0UiQ`,
                title: 'Article',
                translateKey: 'nav.conceptsHelpCenter.article',
                icon: 'helpCeterArticle',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsHelpCenter.articleDesc',
                        label: 'Read support articles',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.helpCenter.editArticle',
                path: `${CONCEPTS_PREFIX_PATH}/news/edit-article/pWBKE_0UiQ`,
                title: 'Edit Article',
                translateKey: 'nav.conceptsHelpCenter.editArticle',
                icon: 'helpCeterEditArticle',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsHelpCenter.editArticleDesc',
                        label: 'Modify article content',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.helpCenter.manageArticle',
                path: `${CONCEPTS_PREFIX_PATH}/news/manage-article`,
                title: 'Manage Article',
                translateKey: 'nav.conceptsHelpCenter.manageArticle',
                icon: 'helpCeterManageArticle',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsHelpCenter.manageArticleDesc',
                        label: 'Article management',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'concepts.ai',
        path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
        title: 'AI',
        translateKey: 'nav.conceptsAi.ai',
        icon: 'ai',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsAi.aiDesc',
                label: 'AI tools and resources',
            },
        },
        subMenu: [],
    },
    {
        key: 'concepts.projects',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks`,
        title: 'Reporte de problemas',
        translateKey: 'nav.conceptsProjects.projects',
        icon: 'projects',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsProjects.projectTasksDesc',
                label: 'Manage project tasks',
            },
        },
        subMenu: [],
    }
]

export default dashboardsNavigationConfig
