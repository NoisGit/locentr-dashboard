import { lazy } from 'react'
import { CONCEPTS_PREFIX_PATH } from '@/constants/route.constant'
import { SUPERADMIN, ADMIN_GROUP } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const workspacesRoute: Routes = [
  {
    key: 'concepts.workspaces.workspacesList',
    path: `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-list`,
    component: lazy(() => import('@/views/concepts/workspaces/WorkspacesList/WorkspacesList')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
  },
  {
    key: 'concepts.workspaces.workspacesCreate',
    path: `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-create`,
    component: lazy(() => import('@/views/concepts/workspaces/WorkspacesCreate/WorkspacesCreate')),
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
    key: 'concepts.workspaces.workspacesEdit',
    path: `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-edit/:id`,
    component: lazy(() => import('@/views/concepts/workspaces/WorkspacesEdit/WorkspacesEdit')),
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
    key: 'concepts.workspaces.workspacesDetails',
    path: `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-details/:id`,
    component: lazy(() => import('@/views/concepts/workspaces/WorkspacesDetails/WorkspacesDetails')),
    authority: [SUPERADMIN, ...ADMIN_GROUP],
    meta: { pageContainerType: 'contained' },
  },
]

export default workspacesRoute
