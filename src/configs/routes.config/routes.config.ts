import dashboardsRoute from './dashboardsRoute'
import uiComponentsRoute from './uiComponentsRoute'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    ...dashboardsRoute,
    ...uiComponentsRoute,
    ...othersRoute,
]
