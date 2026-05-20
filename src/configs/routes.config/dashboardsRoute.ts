import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { SUPERADMIN } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const dashboardsRoute: Routes = [
    {
        key: 'dashboard.dashboard',
        path: `${DASHBOARDS_PREFIX_PATH}`,
        component: lazy(() => import('@/views/dashboards/EcommerceDashboard')),
        authority: [SUPERADMIN],
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
]

export default dashboardsRoute
