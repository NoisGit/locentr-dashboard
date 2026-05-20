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
                title: 'Crear workspace',
                description: 'Crea un nuevo workspace dentro de Coredeck.',
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
                title: 'Editar workspace',
                description: 'Actualiza los datos principales del workspace.',
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
