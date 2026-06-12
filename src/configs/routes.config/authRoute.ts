import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
    {
        key: 'landing',
        path: '/',
        component: lazy(() => import('@/views/landing')),
    },
    {
        key: 'acceptInvitation',
        path: '/accept-invitation',
        component: lazy(() => import('@/views/auth/AcceptInvitation')),
    },
    {
        key: 'verifyEmail',
        path: '/verify-email',
        component: lazy(() => import('@/views/auth/VerifyEmail')),
    },
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
        component: lazy(() => import('@/views/auth/CompanySelect/CompanySelect')),
    },
]

export default authRoute
