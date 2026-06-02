import { lazy } from 'react'
import { SUPERADMIN, ADMIN_GROUP } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const workspacesRoute: Routes = [
    {
        key: 'workspaces.list',
        path: '/workspaces',
        component: lazy(() => import('@/views/workspaces/WorkspacesList/WorkspacesList')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
    },
    {
        key: 'workspaces.create',
        path: '/workspaces/create',
        component: lazy(() => import('@/views/workspaces/WorkspacesCreate/WorkspacesCreate')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
        meta: {
            header: {
                title: 'Crear ubicación',
                description: 'Crea una nueva ubicación dentro de Locentr.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'workspaces.edit',
        path: '/workspaces/:id/edit',
        component: lazy(() => import('@/views/workspaces/WorkspacesEdit/WorkspacesEdit')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
        meta: {
            header: {
                title: 'Editar ubicación',
                description: 'Actualiza los datos principales de la ubicación.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'workspaces.details',
        path: '/workspaces/:id',
        component: lazy(() => import('@/views/workspaces/WorkspacesDetails/WorkspacesDetails')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
        meta: { pageContainerType: 'contained' },
    },
]

export default workspacesRoute
