// src/components/route/SecureRoutesWithCommunities.tsx

import { useEffect, useLayoutEffect, useMemo } from 'react'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { CONCEPTS_PREFIX_PATH, DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'
import { RBAC } from '@/utils/rbac'
import { Role } from '@/utils/rbac/types'
import SecureRoutes from '@/components/rbac/SecureRoutes'
import type { Routes } from '@/@types/routes'

const { unAuthenticatedEntryPath } = appConfig

const AUTH_PREFIX = '/auth'
const COMMUNITY_SELECT_PATH = `${AUTH_PREFIX}/community-select`
const STORAGE_KEY = 'current_community'
const DASHBOARD_HOME = `${DASHBOARDS_PREFIX_PATH}`
const CONDOS_LIST_PATH = `${CONCEPTS_PREFIX_PATH}/condos/condos-list`

interface SecureRoutesWithCommunitiesProps {
    protectedRoutes: Routes
    publicRoutes: Routes
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: any
}

// ============= HELPERS =============

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
        const s = String(obj.id)
        if (s.trim() === '') return null
        return obj
    } catch {
        return null
    }
}

function userLoaded(u: unknown): boolean {
    if (!isRecord(u)) return false
    const keys = Object.keys(u)
    if (keys.length === 0) return false
    const hasAny =
        (u as Record<string, unknown>).email ||
        (u as Record<string, unknown>).id ||
        (u as Record<string, unknown>).user_id ||
        (u as Record<string, unknown>).uid ||
        (u as Record<string, unknown>).role ||
        (u as Record<string, unknown>).roles
    return Boolean(hasAny)
}

// ============= WRAPPER DE RUTAS PROTEGIDAS =============

function ProtectedWrapper() {
    const { authenticated, user } = useAuth()
    const { selectedId, selectCommunity } = useCommunitiesStore()
    const { pathname } = useLocation()

    // Hidratar selección desde localStorage
    useEffect(() => {
        if (selectedId === undefined || selectedId === null || String(selectedId) === '') {
            const stored = readStoredSelection()
            if (stored?.id != null) {
                selectCommunity({ id: stored.id, name: stored.name ?? '' })
            }
        }
    }, [selectedId, selectCommunity])

    // No autenticado → redirigir a login (con URL de retorno)
    if (!authenticated) {
        const redirectQuery =
            pathname === '/' ? '' : `?${REDIRECT_URL_KEY}=${encodeURIComponent(pathname)}`
        return <Navigate replace to={`${unAuthenticatedEntryPath}${redirectQuery}`} />
    }

    // Usuario aún no cargado → esperar
    if (!userLoaded(user)) return null

    // Extraer rol usando RBAC
    const userRole = RBAC.extractUserRole(user)
    const isSuperAdmin = userRole === Role.SUPERADMIN

    const onSelector = pathname === COMMUNITY_SELECT_PATH
    const inAuth = isOnAuthPath(pathname)

    const hasSelection = useMemo(() => {
        if (selectedId !== undefined && selectedId !== null && String(selectedId) !== '')
            return true
        return readStoredSelection() !== null
    }, [selectedId])

    // ========== SUPERADMIN: Lógica especial ==========
    useLayoutEffect(() => {
        if (!isSuperAdmin) return
        const missing = selectedId === undefined || selectedId === null || String(selectedId) === ''
        if (missing) {
            // Crear selección virtual "__SUPER__"
            const virtual = { id: '__SUPER__', name: 'Comunidades' }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(virtual))
            } catch {
                // Ignorar errores de localStorage
            }
            selectCommunity(virtual)
        }
    }, [isSuperAdmin, selectedId, selectCommunity])

    if (isSuperAdmin) {
        const missing = selectedId === undefined || selectedId === null || String(selectedId) === ''
        if (missing) return null // Esperar a que se cree __SUPER__

        // Ruta raíz → Dashboard
        if (pathname === '/') return <Navigate replace to={DASHBOARD_HOME} />

        // SUPERADMIN autenticado no debe ver /auth/*
        if (inAuth) return <Navigate replace to={DASHBOARD_HOME} />

        return <Outlet />
    }

    // ========== ADMIN / SUBADMIN: Lógica de comunidades ==========

    // Ruta raíz → Condos
    if (pathname === '/') return <Navigate replace to={CONDOS_LIST_PATH} />

    // Si está en /auth/* pero NO en el selector → redirigir a condos
    if (inAuth && !onSelector && pathname !== CONDOS_LIST_PATH) {
        return <Navigate replace to={CONDOS_LIST_PATH} />
    }

    // Sin selección de comunidad → debe ir al selector
    if (!hasSelection) {
        if (!onSelector) return <Navigate replace to={COMMUNITY_SELECT_PATH} />
        return <Outlet />
    }

    // Con selección → no quedarse en el selector
    if (onSelector) return <Navigate replace to={CONDOS_LIST_PATH} />

    // ADMIN/SUBADMIN no deben entrar al dashboard (reservado para SUPERADMIN)
    if (
        pathname === '/' ||
        pathname === DASHBOARD_HOME ||
        pathname.startsWith(`${DASHBOARDS_PREFIX_PATH}/`)
    ) {
        return <Navigate replace to={CONDOS_LIST_PATH} />
    }

    return <Outlet />
}

// ============= WRAPPER DE RUTAS PÚBLICAS =============

function PublicWrapper() {
    const { authenticated, user } = useAuth()
    const { pathname } = useLocation()

    // No autenticado → permitir acceso
    if (!authenticated) return <Outlet />

    // Extraer rol usando RBAC
    const userRole = RBAC.extractUserRole(user)
    const isSuper = userRole === Role.SUPERADMIN

    // Bajo /auth/*
    if (isOnAuthPath(pathname)) {
        // SUPERADMIN nunca debe ver /auth/* (ya está autenticado)
        if (isSuper) {
            if (pathname !== DASHBOARD_HOME) {
                return <Navigate replace to={DASHBOARD_HOME} />
            }
            return null
        }

        // ADMIN/SUBADMIN solo pueden ver /auth/community-select
        if (pathname === COMMUNITY_SELECT_PATH) return <Outlet />

        // Cualquier otra ruta de auth → redirigir a condos
        if (pathname !== CONDOS_LIST_PATH) {
            return <Navigate replace to={CONDOS_LIST_PATH} />
        }
        return null
    }

    // Fuera de /auth/* → no intervenir
    return <Outlet />
}

// ============= COMPONENTE PRINCIPAL =============

/**
 * Componente que integra el sistema RBAC con la lógica de comunidades
 * 
 * Características:
 * - Validación RBAC (roles y permisos)
 * - Gestión de comunidades (ADMIN/SUBADMIN)
 * - Selección virtual __SUPER__ para SUPERADMIN
 * - Redirecciones inteligentes según rol
 * 
 * @example
 * ```tsx
 * import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
 * 
 * <SecureRoutesWithCommunities
 *   protectedRoutes={protectedRoutes}
 *   publicRoutes={publicRoutes}
 * />
 * ```
 */
export default function SecureRoutesWithCommunities({
    protectedRoutes,
    publicRoutes,
    pageContainerType,
    layout,
}: SecureRoutesWithCommunitiesProps) {
    return (
        <SecureRoutes
            protectedRoutes={protectedRoutes}
            publicRoutes={publicRoutes}
            protectedWrapper={ProtectedWrapper}
            publicWrapper={PublicWrapper}
        />
    )
}
