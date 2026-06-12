// src/components/rbac/SecureRoutes.tsx

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/auth'
import ProtectedRoute from './ProtectedRoute'
import PageContainer from '@/components/template/PageContainer'
import AppRoute from '@/components/route/AppRoute'
import { Routes as RoutesList, Route as RouteConfig } from '@/@types/routes'
import appConfig from '@/configs/app.config'
import { LayoutType } from '@/@types/theme'

interface SecureRoutesProps {
    protectedRoutes: RoutesList
    publicRoutes: RoutesList
    /**
     * Componente wrapper para rutas protegidas
     */
    protectedWrapper?: React.ComponentType<{ children: React.ReactNode }>
    /**
     * Componente wrapper para rutas públicas
     */
    publicWrapper?: React.ComponentType<{ children: React.ReactNode }>
}

const { authenticatedEntryPath } = appConfig

/**
 * Renderiza una ruta con protección RBAC
 */
const renderProtectedRoute = (route: RouteConfig) => {
    const {
        key,
        path,
        component: Component,
        roles,
        permissions,
        requireAllPermissions,
        meta,
    } = route

    return (
        <Route
            key={key}
            path={path}
            element={
                <ProtectedRoute
                    roles={roles}
                    permissions={permissions}
                    requireAllPermissions={requireAllPermissions}
                >
                    <PageContainer
                        {...meta}
                        layout={meta?.layout as LayoutType}
                        header={typeof meta?.header === 'object' ? meta.header : undefined}
                    >
                        <AppRoute
                            routeKey={key}
                            component={Component}
                            {...{
                                ...meta,
                                layout: meta?.layout as LayoutType,
                            }}
                        />
                    </PageContainer>
                </ProtectedRoute>
            }
        />
    )
}

/**
 * Renderiza una ruta pública (sin protección)
 */
const renderPublicRoute = (route: RouteConfig) => {
    const { key, path, component: Component, meta } = route

    return (
        <Route
            key={key}
            path={path}
            element={
                <AppRoute
                    routeKey={key}
                    component={Component}
                    {...{
                        ...meta,
                        layout: meta?.layout as LayoutType,
                    }}
                />
            }
        />
    )
}

/**
 * Componente principal que maneja el enrutamiento seguro
 * 
 * @example
 * import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
 * 
 * <SecureRoutes 
 *   protectedRoutes={protectedRoutes}
 *   publicRoutes={publicRoutes}
 * />
 */
const SecureRoutes = ({
    protectedRoutes,
    publicRoutes,
    protectedWrapper: ProtectedWrapper,
    publicWrapper: PublicWrapper,
}: SecureRoutesProps) => {
    const { authenticated } = useAuth()

    return (
        <Routes>
            {/* Rutas protegidas con wrapper opcional */}
            {ProtectedWrapper ? (
                <Route element={<ProtectedWrapper><div /></ProtectedWrapper>}>
                    {protectedRoutes.map(renderProtectedRoute)}
                </Route>
            ) : (
                <>{protectedRoutes.map(renderProtectedRoute)}</>
            )}

            {/* Rutas públicas con wrapper opcional */}
            {PublicWrapper ? (
                <Route element={<PublicWrapper><div /></PublicWrapper>}>
                    {publicRoutes.map(renderPublicRoute)}
                </Route>
            ) : (
                <>{publicRoutes.map(renderPublicRoute)}</>
            )}

            {/* Ruta catch-all: redirigir a login si no está autenticado, o a la ruta autenticada si lo está */}
            <Route
                path="*"
                element={
                    <Navigate
                        replace
                        to={authenticated ? authenticatedEntryPath : appConfig.unAuthenticatedEntryPath}
                    />
                }
            />
        </Routes>
    )
}

export default SecureRoutes
