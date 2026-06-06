import { lazy } from 'react'
import type { Routes } from '@/@types/routes'

const authRoute: Routes = [
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
        key: 'otpVerification',
        path: '/auth/otp-verification',
        component: lazy(() => import('@/views/auth/OtpVerification')),
    },
    {
        key: 'companySelect',
        path: '/auth/company-select',
        component: lazy(() => import('@/views/auth/CompanySelect/CompanySelect')),
    },
]

export default authRoute
