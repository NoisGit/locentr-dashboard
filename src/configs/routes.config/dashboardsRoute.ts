// src/views/dashboards/dashboardsRoute.ts
import { lazy } from 'react'
import {
    DASHBOARDS_PREFIX_PATH,
    CONCEPTS_PREFIX_PATH,
} from '@/constants/route.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
    // ==== DASHBOARD PRINCIPAL ====
    {
        key: 'dashboard.dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        component: lazy(() => import('@/views/dashboards/EcommerceDashboard')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
        },
    },

    // ==== AI CHAT ====
    {
        key: 'concepts.ai.chat',
        path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
        component: lazy(() => import('@/views/concepts/ai/Chat')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== USERS ====
    {
        key: 'concepts.users.userList',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
        component: lazy(() => import('@/views/concepts/customers/CustomerList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.users.userEdit',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-edit/:id`,
        component: lazy(() => import('@/views/concepts/customers/CustomerEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit user',
                description: 'Manage user details, purchase history, and preferences.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.users.userCreate',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-create`,
        component: lazy(() => import('@/views/concepts/customers/CustomerCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create user',
                description: 'Manage user details, track purchases, and update preferences easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.users.userDetails',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-details/:id`,
        component: lazy(() => import('@/views/concepts/customers/CustomerDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== ACCESOS ====
    {
        key: 'concepts.access.accessList',
        path: `${CONCEPTS_PREFIX_PATH}/accesses/access-list`,
        component: lazy(() => import('@/views/concepts/accesses/AccessList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.access.accessEdit',
        path: `${CONCEPTS_PREFIX_PATH}/accesses/access-edit/:id`,
        component: lazy(() => import('@/views/concepts/accesses/AccessEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit access',
                description: 'Manage access details and permissions.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.access.accessCreate',
        path: `${CONCEPTS_PREFIX_PATH}/accesses/access-create`,
        component: lazy(() => import('@/views/concepts/accesses/AccessCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create access',
                description: 'Create new access entries easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.access.accessDetails',
        path: `${CONCEPTS_PREFIX_PATH}/accesses/access-details/:id`,
        component: lazy(() => import('@/views/concepts/accesses/AccessDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== PRODUCTS ====
    {
        key: 'concepts.products.productList',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
        component: lazy(() => import('@/views/concepts/products/ProductList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.products.productEdit',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-edit/:id`,
        component: lazy(() => import('@/views/concepts/products/ProductEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit product',
                description: 'Quickly manage product details, stock, and availability.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.products.productCreate',
        path: `${CONCEPTS_PREFIX_PATH}/products/product-create`,
        component: lazy(() => import('@/views/concepts/products/ProductCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create product',
                description:
                    'Quickly add products to your inventory. Enter key details, manage stock, and set availability.',
                contained: true,
            },
            footer: false,
        },
    },

    // ==== PROJECT TASKS ====
    {
        key: 'concepts.projects.projectTasks',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks`,
        component: lazy(() => import('@/views/concepts/projects/Tasks')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'concepts.projects.projectIssue',
        path: `${CONCEPTS_PREFIX_PATH}/projects/tasks/:id`,
        component: lazy(() => import('@/views/concepts/projects/Issue')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== ACCOUNT ====
    {
        key: 'concepts.account.settings',
        path: `${CONCEPTS_PREFIX_PATH}/account/settings`,
        component: lazy(() => import('@/views/concepts/accounts/Settings')),
        authority: [ADMIN, USER],
        meta: {
            header: { title: 'Settings' },
            pageContainerType: 'contained',
        },
    },
    {
        key: 'concepts.account.activityLog',
        path: `${CONCEPTS_PREFIX_PATH}/account/activity-log`,
        component: lazy(() => import('@/views/concepts/accounts/ActivityLog')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'concepts.account.rolesPermissions',
        path: `${CONCEPTS_PREFIX_PATH}/account/roles-permissions`,
        component: lazy(() => import('@/views/concepts/accounts/RolesPermissions')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.account.pricing',
        path: `${CONCEPTS_PREFIX_PATH}/account/pricing`,
        component: lazy(() => import('@/views/concepts/accounts/Pricing')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== NEWS
    {
        key: 'concepts.helpCenter.article',
        path: `${CONCEPTS_PREFIX_PATH}/news/article/:id`,
        component: lazy(() => import('@/views/concepts/news/Article')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },
    {
        key: 'concepts.helpCenter.editArticle',
        path: `${CONCEPTS_PREFIX_PATH}/news/edit-article/:id`,
        component: lazy(() => import('@/views/concepts/news/EditArticle')),
        authority: [ADMIN, USER],
        meta: { pageBackgroundType: 'plain', footer: false },
    },
    {
        key: 'concepts.helpCenter.manageArticle',
        path: `${CONCEPTS_PREFIX_PATH}/news/manage-article`,
        component: lazy(() => import('@/views/concepts/news/ManageArticle')),
        authority: [ADMIN, USER],
        meta: { pageBackgroundType: 'plain', footer: false },
    },
    {
        key: 'concepts.helpCenter.createArticle',
        path: `${CONCEPTS_PREFIX_PATH}/news/create-article`,
        component: lazy(() => import('@/views/concepts/news/CreateArticle/CreateArticle')),
        authority: [ADMIN, USER],
    },

    // ==== CALENDAR ====
    {
        key: 'concepts.calendar',
        path: `${CONCEPTS_PREFIX_PATH}/calendar`,
        component: lazy(() => import('@/views/concepts/calendar/Calendar')),
        authority: [ADMIN, USER],
        meta: {
            pageContainerType: 'contained',
            pageBackgroundType: 'plain',
        },
    },

    // ==== CHAT ====
    {
        key: 'concepts.chat',
        path: `${CONCEPTS_PREFIX_PATH}/chat`,
        component: lazy(() => import('@/views/concepts/chat/Chat')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== MARKETPLACE ====
    {
        key: 'concepts.marketplace.marketplaceList',
        path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-list`,
        component: lazy(() => import('@/views/concepts/marketplace/MarketplaceList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.marketplace.marketplaceEdit',
        path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-edit/:id`,
        component: lazy(() => import('@/views/concepts/marketplace/MarketplaceEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit marketplace item',
                contained: true,
                description: 'Edit marketplace product information',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.marketplace.marketplaceCreate',
        path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-create`,
        component: lazy(() => import('@/views/concepts/marketplace/MarketplaceCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create marketplace item',
                contained: true,
                description: 'Add a new product to the marketplace',
            },
            footer: false,
        },
    },

    // ==== LOGBOOK ====
    {
        key: 'concepts.logbook.logbookList',
        path: `${CONCEPTS_PREFIX_PATH}/logbook/logbook-list`,
        component: lazy(() => import('@/views/concepts/logbook/LogbookList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.logbook.logbookEdit',
        path: `${CONCEPTS_PREFIX_PATH}/logbook/logbook-edit/:id`,
        component: lazy(() => import('@/views/concepts/logbook/LogbookEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Editar novedad',
                contained: true,
                description: 'Edita la información de la novedad',
            },
            footer: false,
        },
    },
    {
        key: 'concepts.logbook.logbookCreate',
        path: `${CONCEPTS_PREFIX_PATH}/logbook/logbook-create`,
        component: lazy(() => import('@/views/concepts/logbook/LogbookCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Agregar novedad',
                contained: true,
                description: 'Agrega una nueva novedad al libro',
            },
            footer: false,
        },
    },

    // ==== ENTRIES ====
    {
        key: 'concepts.entry.entryList',
        path: `${CONCEPTS_PREFIX_PATH}/entries/entry-list`,
        component: lazy(() => import('@/views/concepts/entries/EntryList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.entry.entryEdit',
        path: `${CONCEPTS_PREFIX_PATH}/entries/entry-edit/:id`,
        component: lazy(() => import('@/views/concepts/entries/EntryEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit entry',
                description: 'Manage entry details and information.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.entry.entryCreate',
        path: `${CONCEPTS_PREFIX_PATH}/entries/entry-create`,
        component: lazy(() => import('@/views/concepts/entries/EntryCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create entry',
                description: 'Add new entry to the system.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.entry.entryDetails',
        path: `${CONCEPTS_PREFIX_PATH}/entries/entry-details/:id`,
        component: lazy(() => import('@/views/concepts/entries/EntryDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== PERKS ====
    {
        key: 'concepts.perks.perksList',
        path: `${CONCEPTS_PREFIX_PATH}/perks/perks-list`,
        component: lazy(() => import('@/views/concepts/perks/PerksList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.perks.perksEdit',
        path: `${CONCEPTS_PREFIX_PATH}/perks/perks-edit/:id`,
        component: lazy(() => import('@/views/concepts/perks/PerksEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit perk',
                description: 'Manage perk details and permissions.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.perks.perksCreate',
        path: `${CONCEPTS_PREFIX_PATH}/perks/perks-create`,
        component: lazy(() => import('@/views/concepts/perks/PerksCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create perk',
                description: 'Create new perk entries easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.perks.perksDetails',
        path: `${CONCEPTS_PREFIX_PATH}/perks/perks-details/:id`,
        component: lazy(() => import('@/views/concepts/perks/PerksDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== CONDOS ====
    {
        key: 'concepts.condos.condosList',
        path: `${CONCEPTS_PREFIX_PATH}/condos/condos-list`,
        component: lazy(() => import('@/views/concepts/condos/CondosList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.condos.condosEdit',
        path: `${CONCEPTS_PREFIX_PATH}/condos/condos-edit/:id`,
        component: lazy(() => import('@/views/concepts/condos/CondosEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit condo',
                description: 'Manage condo details and permissions.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.condos.condosCreate',
        path: `${CONCEPTS_PREFIX_PATH}/condos/condos-create`,
        component: lazy(() => import('@/views/concepts/condos/CondosCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create condo',
                description: 'Create new condo entries easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.condos.condosDetails',
        path: `${CONCEPTS_PREFIX_PATH}/condos/condos-details/:id`,
        component: lazy(() => import('@/views/concepts/condos/CondosDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== PROPERTIES ====
    {
        key: 'concepts.properties.propertiesList',
        path: `${CONCEPTS_PREFIX_PATH}/properties/properties-list`,
        component: lazy(() => import('@/views/concepts/properties/PropertiesList/PropertiesList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.properties.propertiesEdit',
        path: `${CONCEPTS_PREFIX_PATH}/properties/properties-edit/:id`,
        component: lazy(() => import('@/views/concepts/properties/PropertiesEdit/PropertiesEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit property',
                description: 'Manage property details and assignments.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.properties.propertiesCreate',
        path: `${CONCEPTS_PREFIX_PATH}/properties/properties-create`,
        component: lazy(() => import('@/views/concepts/properties/PropertiesCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create property',
                description: 'Create new property entries easily.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.properties.propertiesDetails',
        path: `${CONCEPTS_PREFIX_PATH}/properties/properties-details/:id`,
        component: lazy(() => import('@/views/concepts/properties/PropertiesDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },

    // ==== HELP ====
    {
        key: 'concepts.help.manage',
        path: '/concepts/help/manage-help',
        component: lazy(() => import('@/views/concepts/help/ManageHelp/ManageHelp')),
        authority: [ADMIN, USER],
        meta: { pageBackgroundType: 'plain' },
    },
    {
        key: 'concepts.help.create',
        path: '/concepts/help/create-help',
        component: lazy(() => import('@/views/concepts/help/CreateHelp/CreateHelp')),
        authority: [ADMIN, USER],
        meta: { pageBackgroundType: 'plain' },
    },
    {
        key: 'concepts.help.details',
        path: '/concepts/help/help-details/:id',
        component: lazy(() => import('@/views/concepts/help/Help/HelpDetails')),
        authority: [ADMIN, USER],
        meta: { pageBackgroundType: 'plain' },
    },

    // ==== RESIDENTS ====
    {
        key: 'concepts.residents.residentsList',
        path: `${CONCEPTS_PREFIX_PATH}/residents/residents-list`,
        component: lazy(() => import('@/views/concepts/residents/ResidentsList')),
        authority: [ADMIN, USER],
    },
    {
        key: 'concepts.residents.residentsEdit',
        path: `${CONCEPTS_PREFIX_PATH}/residents/residents-edit/:id`,
        component: lazy(() => import('@/views/concepts/residents/ResidentsEdit')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Edit resident',
                description: 'Manage resident details and assignments.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.residents.residentsCreate',
        path: `${CONCEPTS_PREFIX_PATH}/residents/residents-create`,
        component: lazy(() => import('@/views/concepts/residents/ResidentsCreate')),
        authority: [ADMIN, USER],
        meta: {
            header: {
                title: 'Create resident',
                description: 'Create new resident (asignar propiedad y usuario).',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'concepts.residents.residentsDetails',
        path: `${CONCEPTS_PREFIX_PATH}/residents/residents-details/:id`,
        component: lazy(() => import('@/views/concepts/residents/ResidentsDetails')),
        authority: [ADMIN, USER],
        meta: { pageContainerType: 'contained' },
    },
]

export default dashboardsRoute
