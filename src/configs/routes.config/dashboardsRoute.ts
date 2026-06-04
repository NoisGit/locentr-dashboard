import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { Role, Permission } from '@/utils/rbac/types'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
    {
        key: 'dashboard.dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        component: lazy(() => import('@/views/dashboard/Dashboard')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_DASHBOARD],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'companies.list',
        path: '/companies',
        component: lazy(() => import('@/views/companies/CompaniesList')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_COMPANIES],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'companies.create',
        path: '/companies/create',
        component: lazy(() => import('@/views/companies/CompanyCreate')),
        roles: [Role.SUPERADMIN],
        permissions: [Permission.CREATE_COMPANY],
        meta: {
            header: {
                title: 'Create company',
                description: 'Create a new Locentr company.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.subcompanyCreate',
        path: '/companies/subcompany/create',
        component: lazy(() => import('@/views/companies/CompanySubCreate')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.CREATE_COMPANY],
        meta: {
            header: {
                title: 'Create subcompany',
                description: 'Create a subcompany connected to a Locentr company.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.edit',
        path: '/companies/:id/edit',
        component: lazy(() => import('@/views/companies/CompanyEdit')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.EDIT_COMPANY],
        meta: {
            header: {
                title: 'Edit company',
                description: 'Manage Locentr company information.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.details',
        path: '/companies/:id',
        component: lazy(() => import('@/views/companies/CompanyDetails')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_COMPANIES],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'accessManagement.list',
        path: '/access-management',
        component: lazy(() => import('@/views/accessManagement/AccessManagement')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_ACCESS_MANAGEMENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'documents.list',
        path: '/documents',
        component: lazy(() => import('@/views/documents')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_DOCUMENTS],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'notifications.list',
        path: '/notifications',
        component: lazy(() => import('@/views/notifications')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_NOTIFICATIONS],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'auditLog.list',
        path: '/audit-log',
        component: lazy(() => import('@/views/auditLog')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.VIEW_AUDIT_LOG],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'users.list',
        path: '/users',
        component: lazy(() => import('@/views/users/UsersList/UsersList')),
        roles: [Role.SUPERADMIN],
        permissions: [Permission.VIEW_USERS],
    },
    {
        key: 'users.create',
        path: '/users/create',
        component: lazy(() => import('@/views/users/UsersCreate/UsersCreate')),
        roles: [Role.SUPERADMIN],
        permissions: [Permission.CREATE_USER],
        meta: {
            header: {
                title: 'Create user',
                description: 'Create users and assign roles inside Locentr.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'users.edit',
        path: '/users/:id/edit',
        component: lazy(() => import('@/views/users/UserEditView')),
        roles: [Role.SUPERADMIN],
        permissions: [Permission.EDIT_USER],
        meta: {
            header: {
                title: 'Edit user',
                description: 'Manage user information and role.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'users.details',
        path: '/users/:id',
        component: lazy(() => import('@/views/users/UserDetailsView')),
        roles: [Role.SUPERADMIN],
        permissions: [Permission.VIEW_USERS],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'supportTickets.list',
        path: '/support-tickets',
        component: lazy(() => import('@/views/supportTickets/SupportTicketsList')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.CLIENT],
        permissions: [Permission.VIEW_SUPPORT_TICKETS],
        meta: { pageContainerType: 'contained' },
    },
]

export default dashboardsRoute
