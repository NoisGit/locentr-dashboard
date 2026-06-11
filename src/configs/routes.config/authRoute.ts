import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'pricing',
        path: '/pricing',
        component: lazy(() => import('@/views/pricing')),
    },
    {
        key: 'startTrial',
        path: '/start-trial',
        component: lazy(() => import('@/views/pricing/StartTrial')),
    },
    {
        key: 'signIn',
        path: '/auth/sign-in',
        component: lazy(() => import('@/views/auth/SignIn')),
    },
    {
        key: 'forgotPassword',
        path: '/auth/forgot-password',
        component: lazy(() => import('@/views/auth/ForgotPassword')),
    },
    {
        key: 'resetPassword',
        path: '/auth/reset-password',
        component: lazy(() => import('@/views/auth/ResetPassword')),
    },
    {
        key: 'companySelect',
        path: '/auth/company-select',
        component: lazy(
            () => import('@/views/auth/CompanySelect/CompanySelect'),
        ),
    },
]

export default authRoute
