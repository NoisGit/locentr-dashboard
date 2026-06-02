import { lazy } from 'react'
import { SUPERADMIN, ADMIN_GROUP } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const locationsRoute: Routes = [
    {
        key: 'locations.list',
        path: '/locations',
        component: lazy(() => import('@/views/locations/LocationsList/LocationsList')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
    },
    {
        key: 'locations.create',
        path: '/locations/create',
        component: lazy(() => import('@/views/locations/LocationsCreate/LocationsCreate')),
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
        key: 'locations.edit',
        path: '/locations/:id/edit',
        component: lazy(() => import('@/views/locations/LocationsEdit/LocationsEdit')),
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
        key: 'locations.details',
        path: '/locations/:id',
        component: lazy(() => import('@/views/locations/LocationsDetails/LocationsDetails')),
        authority: [SUPERADMIN, ...ADMIN_GROUP],
        meta: { pageContainerType: 'contained' },
    },
]

export default locationsRoute
