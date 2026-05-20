import dashboardsRoute from './dashboardsRoute'
import workspacesRoute from './workspacesRoute'
import authRoute from './authRoute'
import { migrateRoutes, validateRoutes } from '@/utils/rbac/migrateRoutes'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

const rawProtectedRoutes: Routes = [
    ...dashboardsRoute,
    ...workspacesRoute,
]

export const protectedRoutes: Routes = migrateRoutes(rawProtectedRoutes)

if (import.meta.env.DEV) {
    validateRoutes(protectedRoutes)
}
