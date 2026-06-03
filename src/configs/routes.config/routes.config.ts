import dashboardsRoute from './dashboardsRoute'
import locationsRoute from './locationsRoute'
import authRoute from './authRoute'
import { migrateRoutes, validateRoutes } from '@/utils/rbac/migrateRoutes'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

const rawProtectedRoutes: Routes = [
    ...dashboardsRoute,
    ...locationsRoute,
]

export const protectedRoutes: Routes = migrateRoutes(rawProtectedRoutes)

if (import.meta.env.DEV) {
    validateRoutes(protectedRoutes)
}
