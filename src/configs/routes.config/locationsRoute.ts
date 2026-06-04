import { lazy } from 'react'
import { Role, Permission } from '@/utils/rbac/types'
import type { Routes } from '@/@types/routes'

const locationsRoute: Routes = [
    {
        key: 'locations.list',
        path: '/locations',
        component: lazy(() => import('@/views/locations/LocationsList/LocationsList')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
    },
    {
        key: 'locations.create',
        path: '/locations/create',
        component: lazy(() => import('@/views/locations/LocationsCreate/LocationsCreate')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.CREATE_LOCATION],
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
        key: 'locations.edit',
        path: '/locations/:id/edit',
        component: lazy(() => import('@/views/locations/LocationsEdit/LocationsEdit')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.EDIT_LOCATION],
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
        key: 'locations.details',
        path: '/locations/:id',
        component: lazy(() => import('@/views/locations/LocationsDetails/LocationsDetails')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
        meta: { pageContainerType: 'contained' },
    },
]

export default locationsRoute
