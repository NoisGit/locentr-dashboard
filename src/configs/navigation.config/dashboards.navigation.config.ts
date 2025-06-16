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
        key: 'concepts.products',
        path: '',
        title: 'Products',
        translateKey: 'nav.conceptsProducts.products',
        icon: 'products',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsProducts.productsDesc',
                label: 'Product inventory management',
            },
        },
        subMenu: [
            {
                key: 'concepts.products.productList',
                path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
                title: 'Product List',
                translateKey: 'nav.conceptsProducts.productList',
                icon: 'productList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProducts.productListDesc',
                        label: 'All products listed',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.products.productEdit',
                path: `${CONCEPTS_PREFIX_PATH}/products/product-edit/12`,
                title: 'Product Edit',
                translateKey: 'nav.conceptsProducts.productEdit',
                icon: 'productEdit',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProducts.productEditDesc',
                        label: 'Edit product details',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.products.productCreate',
                path: `${CONCEPTS_PREFIX_PATH}/products/product-create`,
                title: 'Product Create',
                translateKey: 'nav.conceptsProducts.productCreate',
                icon: 'productCreate',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProducts.productCreateDesc',
                        label: 'Add new product',
                    },
                },
                subMenu: [],
            },
        ],
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
                        translateKey:
                            'nav.conceptsHelpCenter.supportHubDesc',
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
                        translateKey:
                            'nav.conceptsHelpCenter.articleDesc',
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
                        translateKey:
                            'nav.conceptsHelpCenter.editArticleDesc',
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
                        translateKey:
                            'nav.conceptsHelpCenter.manageArticleDesc',
                        label: 'Article management',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'concepts.ai',
        path: '',
        title: 'AI',
        translateKey: 'nav.conceptsAi.ai',
        icon: 'ai',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsAi.aiDesc',
                label: 'AI tools and resources',
            },
        },
        subMenu: [
            {
                key: 'concepts.ai.chat',
                path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
                title: 'Chat',
                translateKey: 'nav.conceptsAi.chat',
                icon: 'aiChat',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey: 'nav.conceptsAi.chatDesc',
                        label: 'AI-powered chat systems',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'concepts.projects',
        path: '',
        title: 'Reporte de problemas',
        translateKey: 'nav.conceptsProjects.projects',
        icon: 'projects',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        meta: {
            description: {
                translateKey: 'nav.conceptsProjects.projectsDesc',
                label: 'Manage and track projects',
            },
        },
        subMenu: [
            {
                key: 'concepts.projects.scrumBoard',
                path: `${CONCEPTS_PREFIX_PATH}/projects/scrum-board`,
                title: 'Scrum Board',
                translateKey: 'nav.conceptsProjects.scrumBoard',
                icon: 'projectScrumBoard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProjects.scrumBoardDesc',
                        label: 'Manage your scrum workflow',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.projects.projectList',
                path: `${CONCEPTS_PREFIX_PATH}/projects/project-list`,
                title: 'Project List',
                translateKey: 'nav.conceptsProjects.projectList',
                icon: 'projectList',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProjects.projectListDesc',
                        label: 'Organize all projects',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.projects.projectDetails',
                path: `${CONCEPTS_PREFIX_PATH}/projects/project-details/27`,
                title: 'Details',
                translateKey: 'nav.conceptsProjects.projectDetails',
                icon: 'projectDetails',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProjects.projectDetailsDesc',
                        label: 'Project detailed information',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.projects.projectTasks',
                path: `${CONCEPTS_PREFIX_PATH}/projects/tasks`,
                title: 'Tasks',
                translateKey: 'nav.conceptsProjects.projectTasks',
                icon: 'projectTask',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProjects.projectTasksDesc',
                        label: 'Manage project tasks',
                    },
                },
                subMenu: [],
            },
            {
                key: 'concepts.projects.projectIssue',
                path: `${CONCEPTS_PREFIX_PATH}/projects/tasks/1`,
                title: 'Issue',
                translateKey: 'nav.conceptsProjects.projectIssue',
                icon: 'projectIssue',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                meta: {
                    description: {
                        translateKey:
                            'nav.conceptsProjects.projectIssueDesc',
                        label: 'Resolve project issues',
                    },
                },
                subMenu: [],
            },
        ],
    },
    {
        key: 'dashboard.project',
        path: `${DASHBOARDS_PREFIX_PATH}/project`,
        title: 'Project',
        translateKey: 'nav.dashboard.project',
        icon: 'dashboardProject',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
    }
]

export default dashboardsNavigationConfig
