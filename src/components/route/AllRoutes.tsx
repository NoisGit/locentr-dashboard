import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import AuthorityGuard from './AuthorityGuard'
import AppRoute from './AppRoute'
import PageContainer from '@/components/template/PageContainer'
import { protectedRoutes, publicRoutes } from '@/configs/routes.config'
import { useAuth } from '@/auth'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { LayoutType } from '@/@types/theme'
import { getUserRoles } from '@/utils/authority'
import { DASHBOARDS_PREFIX_PATH } from '@/constants/route.constant'

interface ViewsProps {
  pageContainerType?: 'default' | 'gutterless' | 'contained'
  layout?: LayoutType
}
type AllRoutesProps = ViewsProps

const SUPER_ENTRY = `${DASHBOARDS_PREFIX_PATH}`
const DEFAULT_ENTRY = `${DASHBOARDS_PREFIX_PATH}`

const AllRoutes = (props: AllRoutesProps) => {
  const { user } = useAuth()

  const roles = getUserRoles(user)
  const isSuper = roles.has('SUPERADMIN')
  const entryPath = isSuper ? SUPER_ENTRY : DEFAULT_ENTRY

  const toAuthChildPath = (p: string) => p.replace(/^\/?auth\/?/, '')

  return (
    <Routes>
      <Route path="/auth/*" element={<PublicRoute />}>
        <Route index element={<Navigate replace to="sign-in" />} />
        {publicRoutes.map((route) => (
          <Route
            key={route.key}
            path={toAuthChildPath(route.path)}
            element={<AppRoute routeKey={route.key} component={route.component} {...route.meta} />}
          />
        ))}
        <Route path="*" element={<Navigate replace to="sign-in" />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate replace to={entryPath} />} />

        {protectedRoutes.map((route, index) => (
          <Route
            key={route.key + index}
            path={route.path}
            element={
              <AuthorityGuard userAuthority={user} authority={route.authority}>
                <PageContainer {...props} {...route.meta}>
                  <AppRoute routeKey={route.key} component={route.component} {...route.meta} />
                </PageContainer>
              </AuthorityGuard>
            }
          />
        ))}

        <Route path="*" element={<Navigate replace to={entryPath} />} />
      </Route>
    </Routes>
  )
}

export default AllRoutes
