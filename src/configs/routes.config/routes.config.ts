import dashboardsRoute from './dashboardsRoute'
import locationsRoute from './locationsRoute'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    ...dashboardsRoute,
    ...locationsRoute,
]
