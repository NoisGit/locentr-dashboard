import { lazy } from 'react'
import { Role, Permission } from '@/utils/rbac/types'
import type { Routes } from '@/@types/routes'

const locationsRoute: Routes = [
    {
        key: 'locations.list',
        path: '/buildings',
        component: lazy(() => import('@/views/locations/LocationsList/LocationsList')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
    },
    {
        key: 'locations.create',
        path: '/buildings/create',
        component: lazy(() => import('@/views/locations/LocationsCreate/LocationsCreate')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.CREATE_LOCATION],
        meta: {
            header: {
                title: 'Crear edificio',
                description: 'Crea un nuevo edificio dentro de Locentr.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'locations.edit',
        path: '/buildings/:id/edit',
        component: lazy(() => import('@/views/locations/LocationsEdit/LocationsEdit')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.EDIT_LOCATION],
        meta: {
            header: {
                title: 'Editar edificio',
                description: 'Actualiza los datos principales del edificio.',
                contained: true,
            },
            footer: false,
        },
    },
    {
        key: 'locations.details',
        path: '/buildings/:id',
        component: lazy(() => import('@/views/locations/LocationsDetails/LocationsDetails')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
        meta: { pageContainerType: 'contained' },
    },
    {
        key: 'locations.legacyList',
        path: '/locations',
        component: lazy(() => import('@/views/locations/LocationsList/LocationsList')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
    },
    {
        key: 'locations.legacyCreate',
        path: '/locations/create',
        component: lazy(() => import('@/views/locations/LocationsCreate/LocationsCreate')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.CREATE_LOCATION],
    },
    {
        key: 'locations.legacyEdit',
        path: '/locations/:id/edit',
        component: lazy(() => import('@/views/locations/LocationsEdit/LocationsEdit')),
        roles: [Role.SUPERADMIN, Role.ADMIN],
        permissions: [Permission.EDIT_LOCATION],
    },
    {
        key: 'locations.legacyDetails',
        path: '/locations/:id',
        component: lazy(() => import('@/views/locations/LocationsDetails/LocationsDetails')),
        roles: [Role.SUPERADMIN, Role.ADMIN, Role.OPERATOR, Role.CLIENT],
        permissions: [Permission.VIEW_LOCATIONS],
    },
]

export default locationsRoute
