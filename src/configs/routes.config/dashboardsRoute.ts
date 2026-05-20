import { lazy } from 'react'
import { DASHBOARDS_PREFIX_PATH, CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
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
        path: `${CONCEPTS_PREFIX_PATH}/users/users-list`,
        component: lazy(() => import('@/views/concepts/users/UsersList/UsersList')),
        authority: [SUPERADMIN],
    },
    {
        key: 'users.edit',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-edit/:id`,
        component: lazy(() => import('@/views/concepts/users/UsersEdit')),
        authority: [SUPERADMIN],
        meta: {
            header: {
                title: 'Editar usuario',
                description: 'Gestiona los datos y rol del usuario.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'users.create',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-create`,
        component: lazy(() => import('@/views/concepts/users/UsersCreate')),
        authority: [SUPERADMIN],
        meta: {
            header: {
                title: 'Crear usuario',
                description: 'Crea usuarios y asigna roles dentro de Coredeck.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'users.details',
        path: `${CONCEPTS_PREFIX_PATH}/users/users-details/:id`,
        component: lazy(() => import('@/views/concepts/users/UsersDetails')),
        authority: [SUPERADMIN],
        meta: { pageContainerType: 'contained' },
    },
]

export default dashboardsRoute
