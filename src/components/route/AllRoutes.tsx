import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import PageContainer from '@/components/template/PageContainer'
import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
import { useAuth } from '@/auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'

interface ViewsProps {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    layout?: LayoutType
}

type AllRoutesProps = ViewsProps

const ENTRY_PATH = DASHBOARDS_PREFIX_PATH

function toAuthChildPath(path: string) {
    return path.replace(/^\/?auth\/?/, '')
}

const AllRoutes = (props: AllRoutesProps) => {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/auth/*" element={<PublicRoute />}>
                <Route index element={<Navigate replace to="sign-in" />} />
                {publicRoutes.map((route) => (
                    <Route
                        key={route.key}
                        path={toAuthChildPath(route.path)}
                        element={
                            <AppRoute
                                routeKey={route.key}
                                component={route.component}
                                {...route.meta}
                            />
                        }
                    />
                ))}
                <Route path="*" element={<Navigate replace to="sign-in" />} />
            </Route>

            <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<Navigate replace to={ENTRY_PATH} />} />

                {protectedRoutes.map((route) => (
                    <Route
                        key={route.key}
                        path={route.path}
                        element={
                            <AuthorityGuard
                                userAuthority={user}
                                roles={route.roles}
                                permissions={route.permissions}
                                requireAllPermissions={route.requireAllPermissions}
                            >
                                <PageContainer {...props} {...route.meta}>
                                    <AppRoute
                                        routeKey={route.key}
                                        component={route.component}
                                        {...route.meta}
                                    />
                                </PageContainer>
                            </AuthorityGuard>
                        }
                    />
                ))}

                <Route path="*" element={<Navigate replace to={ENTRY_PATH} />} />
            </Route>
        </Routes>
    )
}

export default AllRoutes
