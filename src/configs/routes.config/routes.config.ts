import dashboardsRoute from './dashboardsRoute'
import workspacesRoute from './workspacesRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import { migrateRoutes, validateRoutes } from '@/utils/rbac/migrateRoutes'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

// Migrar rutas protegidas del sistema antiguo (authority) al nuevo (RBAC)
const rawProtectedRoutes: Routes = [
    ...dashboardsRoute,
    ...workspacesRoute,
    ...uiComponentsRoute,
    ...othersRoute,
]

export const protectedRoutes: Routes = migrateRoutes(rawProtectedRoutes)

// Validar configuración en desarrollo
if (import.meta.env.DEV) {
    validateRoutes(protectedRoutes)
}
