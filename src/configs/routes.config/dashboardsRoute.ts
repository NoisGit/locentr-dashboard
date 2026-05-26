import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, CLIENT, OPERATOR, SUPERADMIN } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
    {
        key: 'dashboard.dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        component: lazy(() => import('@/views/dashboard/Dashboard')),
        authority: [SUPERADMIN, ADMIN, CLIENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'companies.list',
        path: '/companies',
        component: lazy(() => import('@/views/companies/CompaniesList')),
        authority: [SUPERADMIN, ADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'companies.create',
        path: '/companies/create',
        component: lazy(() => import('@/views/companies/CompanyCreate')),
        authority: [SUPERADMIN],
        meta: {
            header: {
                title: 'Create company',
                description: 'Create a new Coredeck company.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.subcompanyCreate',
        path: '/companies/subcompany/create',
        component: lazy(() => import('@/views/companies/CompanySubCreate')),
        authority: [SUPERADMIN, ADMIN],
        meta: {
            header: {
                title: 'Create subcompany',
                description: 'Create a subcompany connected to a Coredeck company.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.edit',
        path: '/companies/:id/edit',
        component: lazy(() => import('@/views/companies/CompanyEdit')),
        authority: [SUPERADMIN, ADMIN],
        meta: {
            header: {
                title: 'Edit company',
                description: 'Manage Coredeck company information.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'companies.details',
        path: '/companies/:id',
        component: lazy(() => import('@/views/companies/CompanyDetails')),
        authority: [SUPERADMIN, ADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'accessManagement.list',
        path: '/access-management',
        component: lazy(() => import('@/views/accessManagement/AccessManagement')),
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'documents.list',
        path: '/documents',
        component: lazy(() => import('@/views/documents')),
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'notifications.list',
        path: '/notifications',
        component: lazy(() => import('@/views/notifications')),
        authority: [SUPERADMIN, ADMIN, OPERATOR, CLIENT],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'users.list',
        path: '/users',
        component: lazy(() => import('@/views/users/UsersList/UsersList')),
        authority: [SUPERADMIN],
    },
    {
        key: 'users.create',
        path: '/users/create',
        component: lazy(() => import('@/views/users/UsersCreate/UsersCreate')),
        authority: [SUPERADMIN],
        meta: {
            header: {
                title: 'Create user',
                description: 'Create users and assign roles inside Coredeck.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'users.edit',
        path: '/users/:id/edit',
        component: lazy(() => import('@/views/users/UserEditView')),
        authority: [SUPERADMIN],
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
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'supportTickets.list',
        path: '/support-tickets',
        component: lazy(() => import('@/views/supportTickets/SupportTicketsList')),
        authority: [SUPERADMIN, ADMIN, CLIENT],
        meta: { pageContainerType: 'contained' },
    },
]

export default dashboardsRoute
