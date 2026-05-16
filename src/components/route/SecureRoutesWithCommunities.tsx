// src/components/route/SecureRoutesWithCommunities.tsx

import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCompaniesStore } from '@/store/companies/CompaniesStore'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { CONCEPTS_PREFIX_PATH, DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { RBAC } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'
import SecureRoutes from '@/components/rbac/SecureRoutes'
import type { Routes } from '@/@types/routes'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'
const COMPANY_SELECT_PATH = `${AUTH_PREFIX}/company-select`
const STORAGE_KEY = 'current_company'
const DASHBOARD_HOME = `${DASHBOARDS_PREFIX_PATH}`
const WORKSPACES_LIST_PATH = `${CONCEPTS_PREFIX_PATH}/workspaces/workspaces-list`

interface SecureRoutesWithCommunitiesProps {
    protectedRoutes: Routes
    publicRoutes: Routes
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: any
}

function isOnAuthPath(pathname: string) {
    return pathname === AUTH_PREFIX || pathname.startsWith(`${AUTH_PREFIX}/`)
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null
}

function readStoredSelection(): { id?: string | number; name?: string } | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null
        const obj = JSON.parse(raw) as { id?: string | number; name?: string }
        if (obj?.id === undefined || obj?.id === null) return null
        const id = String(obj.id)
        if (id.trim() === '') return null
        return obj
    } catch {
        return null
    }
}

function userLoaded(user: unknown): boolean {
    if (!isRecord(user)) return false
    const keys = Object.keys(user)
    if (keys.length === 0) return false

    return Boolean(
        user.email ||
        user.id ||
        user.user_id ||
        user.uid ||
        user.role ||
        user.roles,
    )
}

function ProtectedWrapper() {
    const { authenticated, user } = useAuth()
    const { selectedId, selectCompany } = useCompaniesStore()
    const { pathname } = useLocation()

    const userRole = RBAC.extractUserRole(user)
    const isSuperAdmin = userRole === Role.SUPERADMIN

    const onSelector = pathname === COMPANY_SELECT_PATH
    const inAuth = isOnAuthPath(pathname)

    const hasSelection = useMemo(() => {
        if (selectedId !== undefined && selectedId !== null && String(selectedId) !== '') {
            return true
        }
        return readStoredSelection() !== null
    }, [selectedId])

    useEffect(() => {
        if (isSuperAdmin) return
        if (selectedId === undefined || selectedId === null || String(selectedId) === '') {
            const stored = readStoredSelection()
            if (stored?.id != null) {
                selectCompany({ id: stored.id, name: stored.name ?? '' })
            }
        }
    }, [isSuperAdmin, selectedId, selectCompany])

    if (!authenticated) {
        let isLoggingOut = false
        try {
            isLoggingOut = sessionStorage.getItem('__isLoggingOut') === 'true'
        } catch { }

        const redirectQuery =
            !isLoggingOut && pathname !== '/' ? `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}` : ''
        return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
    }

    if (!userLoaded(user)) return null

    if (isSuperAdmin) {
        if (pathname === '/') return <Navigate replace to={DASHBOARD_HOME} />
        if (inAuth) return <Navigate replace to={DASHBOARD_HOME} />
        return <Outlet />
    }

    if (pathname === '/') return <Navigate replace to={WORKSPACES_LIST_PATH} />

    if (inAuth && !onSelector && pathname !== WORKSPACES_LIST_PATH) {
        return <Navigate replace to={WORKSPACES_LIST_PATH} />
    }

    if (!hasSelection) {
        if (!onSelector) return <Navigate replace to={COMPANY_SELECT_PATH} />
        return <Outlet />
    }

    if (onSelector) return <Navigate replace to={WORKSPACES_LIST_PATH} />

    if (
        pathname === '/' ||
        pathname === DASHBOARD_HOME ||
        pathname.startsWith(`${DASHBOARDS_PREFIX_PATH}/`)
    ) {
        return <Navigate replace to={WORKSPACES_LIST_PATH} />
    }

    return <Outlet />
}

function PublicWrapper() {
    const { authenticated, user } = useAuth()
    const { pathname } = useLocation()

    const userRole = RBAC.extractUserRole(user)
    const isSuper = userRole === Role.SUPERADMIN

    if (!authenticated) return <Outlet />

    if (isOnAuthPath(pathname)) {
        if (isSuper) {
            if (pathname !== DASHBOARD_HOME) {
                return <Navigate replace to={DASHBOARD_HOME} />
            }
            return null
        }

        if (pathname === COMPANY_SELECT_PATH) return <Outlet />

        if (pathname !== WORKSPACES_LIST_PATH) {
            return <Navigate replace to={WORKSPACES_LIST_PATH} />
        }
        return null
    }

    return <Outlet />
}

export default function SecureRoutesWithCommunities({
    protectedRoutes,
    publicRoutes,
    pageContainerType,
    layout,
}: SecureRoutesWithCommunitiesProps) {
    useLayoutEffect(() => {
        void pageContainerType
        void layout
    }, [pageContainerType, layout])

    return (
        <SecureRoutes
            protectedRoutes={protectedRoutes}
            publicRoutes={publicRoutes}
            protectedWrapper={ProtectedWrapper}
            publicWrapper={PublicWrapper}
        />
    )
}
