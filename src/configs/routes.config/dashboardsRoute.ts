import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH, CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { SUPERADMIN, ADMIN_GROUP } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
  /* ----------------------- PANEL (oculto para admin/subadmin/user) ----------------------- */
  {
    key: 'dashboard.dashboard',
    path: `${DASHBOARDS_PREFIX_PATH}`,
    component: lazy(() => import('@/views/dashboards/EcommerceDashboard')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- IA (oculto para admin/subadmin/user) ------------------------- */
  {
    key: 'concepts.ai.chat',
    path: `${CONCEPTS_PREFIX_PATH}/ai/chat`,
    component: lazy(() => import('@/views/concepts/ai/Chat')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- USUARIOS (solo superadmin) ---------------------------------- */
  {
    key: 'concepts.users.userList',
    path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
    component: lazy(() => import('@/views/concepts/users/UsersList')),
    authority: [SUPERADMIN],
  },
  {
    key: 'concepts.users.userEdit',
    path: `${CONCEPTS_PREFIX_PATH}/users/users-edit/:id`,
    component: lazy(() => import('@/views/concepts/users/UsersEdit')),
    authority: [SUPERADMIN],
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
    component: lazy(() => import('@/views/concepts/users/UsersCreate')),
    authority: [SUPERADMIN],
    meta: {
      header: {
        title: 'Crear Usuario',
        description: 'Manage user details, track purchases, and update preferences easily.',
        contained: true,
      },
      footer: false,
    },
  },
  {
    key: 'concepts.users.userDetails',
    path: `${CONCEPTS_PREFIX_PATH}/users/users-details/:id`,
    component: lazy(() => import('@/views/concepts/users/UsersDetails')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- ACCESOS (solo superadmin) ----------------------------------- */
  {
    key: 'concepts.access.accessList',
    path: `${CONCEPTS_PREFIX_PATH}/accesses/access-list`,
    component: lazy(() => import('@/views/concepts/accesses/AccessList')),
    authority: [SUPERADMIN],
  },
  {
    key: 'concepts.access.accessEdit',
    path: `${CONCEPTS_PREFIX_PATH}/accesses/access-edit/:id`,
    component: lazy(() => import('@/views/concepts/accesses/AccessEdit')),
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- ACCESS POINTS (HARDWARE) ------------------------------------ */
  {
    key: 'concepts.accesspoints.accesspointsList',
    path: `${CONCEPTS_PREFIX_PATH}/accesspoints/accesspoints-list`,
    component: lazy(() => import('@/views/concepts/accesspoints/AccessPointsList/AccessPointsList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },
  {
    key: 'concepts.accesspoints.accesspointsEdit',
    path: `${CONCEPTS_PREFIX_PATH}/accesspoints/accesspoints-edit/:id`,
    component: lazy(() => import('@/views/concepts/accesspoints/AccessPointsEdit/AccessPointsEdit')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: {
      header: {
        title: 'Editar Access Point',
        description: 'Edita el nombre y ubicación; otros campos informativos se muestran en solo lectura.',
        contained: true,
      },
      footer: false,
    },
  },

  /* ----------------------- PRODUCTS/AMENITIES (visible para SUPERADMIN y grupo admin) ------------- */
  {
    key: 'concepts.products.productList',
    path: `${CONCEPTS_PREFIX_PATH}/products/product-list`,
    component: lazy(() => import('@/views/concepts/products/ProductList')),
    authority: [SUPERADMIN],
  },
  {
    key: 'concepts.products.productEdit',
    path: `${CONCEPTS_PREFIX_PATH}/products/product-edit/:id`,
    component: lazy(() => import('@/views/concepts/products/ProductEdit')),
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
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

  /* ----------------------- INCIDENTS ---------------------------------------------------- */
  {
    key: 'concepts.incidents.list',
    path: `${CONCEPTS_PREFIX_PATH}/incidents`,
    component: lazy(() => import('@/views/concepts/incidents/IncidentList/IncidentList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },
  {
    key: 'concepts.incidents.details',
    path: `${CONCEPTS_PREFIX_PATH}/incidents/:id`,
    component: lazy(() => import('@/views/concepts/incidents/IncidentDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- ACCOUNT ------------------------------------------------------ */
  {
    key: 'concepts.account.settings',
    path: `${CONCEPTS_PREFIX_PATH}/account/settings`,
    component: lazy(() => import('@/views/concepts/accounts/Settings')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: {
      header: { title: 'Settings' },
      pageContainerType: 'contained',
    },
  },
  {
    key: 'concepts.account.activityLog',
    path: `${CONCEPTS_PREFIX_PATH}/account/activity-log`,
    component: lazy(() => import('@/views/concepts/accounts/ActivityLog')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },
  {
    key: 'concepts.account.rolesPermissions',
    path: `${CONCEPTS_PREFIX_PATH}/account/roles-permissions`,
    component: lazy(() => import('@/views/concepts/accounts/RolesPermissions')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained', pageBackgroundType: 'plain' },
  },

  /* ----------------------- PLAN (solo superadmin) -------------------------------------- */
  {
    key: 'concepts.account.pricing',
    path: `${CONCEPTS_PREFIX_PATH}/account/pricing`,
    component: lazy(() => import('@/views/concepts/accounts/Pricing')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- NEWS --------------------------------------------------------- */
  {
    key: 'concepts.helpCenter.editArticle',
    path: `${CONCEPTS_PREFIX_PATH}/news/edit-article/:id`,
    component: lazy(() => import('@/views/concepts/news/EditArticle')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageBackgroundType: 'plain', footer: false },
  },
  {
    key: 'concepts.helpCenter.manageArticle',
    path: `${CONCEPTS_PREFIX_PATH}/news/manage-article`,
    component: lazy(() => import('@/views/concepts/news/ManageArticle')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageBackgroundType: 'plain', footer: false },
  },
  {
    key: 'concepts.helpCenter.createArticle',
    path: `${CONCEPTS_PREFIX_PATH}/news/create-article`,
    component: lazy(() => import('@/views/concepts/news/CreateArticle/CreateArticle')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },

  /* ----------------------- CALENDARIO (solo superadmin) -------------------------------- */
  {
    key: 'concepts.calendar',
    path: `${CONCEPTS_PREFIX_PATH}/calendar`,
    component: lazy(() => import('@/views/concepts/calendar/Calendar')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained', pageBackgroundType: 'plain' },
  },

  /* ----------------------- CHAT (solo superadmin) -------------------------------------- */
  {
    key: 'concepts.chat',
    path: `${CONCEPTS_PREFIX_PATH}/chat`,
    component: lazy(() => import('@/views/concepts/chat/Chat')),
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- MARKETPLACE (solo superadmin) ------------------------------- */
  {
    key: 'concepts.marketplace.marketplaceList',
    path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-list`,
    component: lazy(() => import('@/views/concepts/marketplace/MarketplaceList')),
    authority: [SUPERADMIN],
  },
  {
    key: 'concepts.marketplace.marketplaceEdit',
    path: `${CONCEPTS_PREFIX_PATH}/marketplace/marketplace-edit/:id`,
    component: lazy(() => import('@/views/concepts/marketplace/MarketplaceEdit')),
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
    meta: {
      header: {
        title: 'Create marketplace item',
        contained: true,
        description: 'Add a new product to the marketplace',
      },
      footer: false,
    },
  },

  /* ----------------------- LOGBOOK ------------------------------------------------------ */
  {
    key: 'concepts.logbook.logbookList',
    path: `${CONCEPTS_PREFIX_PATH}/logbook/logbook-list`,
    component: lazy(() => import('@/views/concepts/logbook/LogbookList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },

  /* ----------------------- ENTRIES ------------------------------------------------------ */
  {
    key: 'concepts.entry.entryList',
    path: `${CONCEPTS_PREFIX_PATH}/entries/entry-list`,
    component: lazy(() => import('@/views/concepts/entries/EntryList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },
  {
    key: 'concepts.entry.entryDetails',
    path: `${CONCEPTS_PREFIX_PATH}/entries/entry-details/:id`,
    component: lazy(() => import('@/views/concepts/entries/EntryDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- PERKS (solo superadmin) -------------------------- */
  {
    key: 'concepts.perks.perksList',
    path: `${CONCEPTS_PREFIX_PATH}/perks/perks-list`,
    component: lazy(() => import('@/views/concepts/perks/PerksList')),
    authority: [SUPERADMIN],
  },
  {
    key: 'concepts.perks.perksEdit',
    path: `${CONCEPTS_PREFIX_PATH}/perks/perks-edit/:id`,
    component: lazy(() => import('@/views/concepts/perks/PerksEdit')),
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- CONDOS ------------------------------------------------------- */
  {
    key: 'concepts.condos.condosList',
    path: `${CONCEPTS_PREFIX_PATH}/condos/condos-list`,
    component: lazy(() => import('@/views/concepts/condos/CondosList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },
  {
    key: 'concepts.condos.condosEdit',
    path: `${CONCEPTS_PREFIX_PATH}/condos/condos-edit/:id`,
    component: lazy(() => import('@/views/concepts/condos/CondosEdit')),
    authority: [SUPERADMIN],
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
    authority: [SUPERADMIN],
    meta: {
      header: {
        title: 'Crear Condo',
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
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- HELP --------------------------------------------------------- */
  {
    key: 'concepts.help.manage',
    path: '/concepts/help/manage-help',
    component: lazy(() => import('@/views/concepts/help/ManageHelp/ManageHelp')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageBackgroundType: 'plain' },
  },
  {
    key: 'concepts.help.create',
    path: '/concepts/help/create-help',
    component: lazy(() => import('@/views/concepts/help/CreateHelp/CreateHelp')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageBackgroundType: 'plain' },
  },
  {
    key: 'concepts.help.details',
    path: '/concepts/help/help-details/:id',
    component: lazy(() => import('@/views/concepts/help/Help/HelpDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageBackgroundType: 'plain' },
  },

  /* ----------------------- RESIDENTES --------------------------------------------------- */
  {
    key: 'concepts.residents.residentsList',
    path: `${CONCEPTS_PREFIX_PATH}/residents/residents-list`,
    component: lazy(() => import('@/views/concepts/residents/ResidentsList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },
  {
    key: 'concepts.residents.residentsEdit',
    path: `${CONCEPTS_PREFIX_PATH}/residents/residents-edit/:id`,
    component: lazy(() => import('@/views/concepts/residents/ResidentsEdit')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: {
      header: {
        title: 'Editar residente',
        description: 'Manage resident details and assignments.',
        contained: true,
      },
      footer: false,
    },
  },
  {
    key: 'concepts.residents.residentsDetails',
    path: `${CONCEPTS_PREFIX_PATH}/residents/residents-details/:id`,
    component: lazy(() => import('@/views/concepts/residents/ResidentsDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- MAILBOX ------------------------------------------------------ */
  {
    key: 'concepts.mailbox.mailboxList',
    path: `${CONCEPTS_PREFIX_PATH}/mailbox/mailbox-list`,
    component: lazy(() => import('@/views/concepts/mailbox/MailboxList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- INVITATIONS -------------------------------------------------- */
  {
    key: 'concepts.invitations.invitationsList',
    path: `${CONCEPTS_PREFIX_PATH}/invitations/invitations-list`,
    component: lazy(() => import('@/views/concepts/invitations/InvitationsList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- PROPERTIES --------------------------------------------------- */
  {
    key: 'concepts.properties.propertiesList',
    path: `${CONCEPTS_PREFIX_PATH}/properties/properties-list`,
    component: lazy(() => import('@/views/concepts/properties/PropertiesList/PropertiesList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },
  {
    key: 'concepts.properties.propertiesEdit',
    path: `${CONCEPTS_PREFIX_PATH}/properties/properties-edit/:id`,
    component: lazy(() => import('@/views/concepts/properties/PropertiesEdit/PropertiesEdit')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: {
      header: {
        title: '',
        description: 'Manage property details and assignments.',
        contained: true,
      },
      footer: false,
    },
  },
  {
    key: 'concepts.properties.propertiesDetails',
    path: `${CONCEPTS_PREFIX_PATH}/properties/properties-details/:id`,
    component: lazy(() => import('@/views/concepts/properties/PropertiesDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },

  /* ----------------------- COLLABORATORS ------------------------------------------------ */
  {
    key: 'concepts.collaborators.collaboratorsEdit',
    path: `${CONCEPTS_PREFIX_PATH}/collaborators/collaborators-edit/:id`,
    component: lazy(() => import('@/views/concepts/collaborators/CollaboratorsEdit')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: {
      header: {
        title: 'Editar colaborador',
        description: 'Edita nombre, teléfono y contraseña (correo y rol son solo lectura).',
        contained: true,
      },
      footer: false,
    },
  },
]

export default dashboardsRoute
