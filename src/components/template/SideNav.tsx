import classNames from 'classnames'
import locentrLogo from '@/assets/locentr-logo.svg'
import locentrIcon from '@/assets/locentr-icon.svg'

import { useThemeStore } from '@/store/themeStore'
import { APP_NAME } from '@/constants/app.constant'
import { Link } from 'react-router-dom'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import ScrollBar from '@/components/ui/ScrollBar'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { useSessionUser } from '@/store/authStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
} from '@/constants/theme.constant'
import { useMemo } from 'react'

import { useAuth } from '@/auth'
import { RBAC } from '@/utils/rbac/rbacCore'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

function normalizeAuthority(authority: unknown): Set<string> {
    const roles = new Set<string>()

    const add = (value: unknown) => {
        if (value == null) return

        if (typeof value === 'string') {
            roles.add(value.toUpperCase())
            return
        }

        if (Array.isArray(value)) {
            value.forEach(add)
            return
        }

        if (typeof value === 'object') {
            const record = value as Record<string, unknown>
            add(record.name ?? record.role ?? record.authority ?? record.code)
        }
    }

    add(authority)
    return roles
}

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    contentClass,
}: SideNavProps) => {
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore((state) => state.layout.sideNavCollapse)
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const rawAuthority = useSessionUser((state) => state.user.authority)

    const { user } = useAuth()
    const effectiveRole = RBAC.extractUserRole(user)

    const roles = useMemo(() => {
        const nextRoles = normalizeAuthority(rawAuthority)
        if (effectiveRole) nextRoles.add(effectiveRole)
        return [...nextRoles]
    }, [rawAuthority, effectiveRole])

    const logoSrc = sideNavCollapse ? locentrIcon : locentrLogo

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav flex flex-col justify-between',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <Link
                to={appConfig.authenticatedEntryPath}
                className="side-nav-header flex items-center justify-center w-full h-[90px]"
            >
                <img
                    src={logoSrc}
                    alt={`${APP_NAME} logo`}
                    className={sideNavCollapse ? 'max-h-[38px]' : 'max-h-[40px]'}
                    style={{ margin: '0 auto', display: 'block', objectFit: 'contain' }}
                    draggable={false}
                />
            </Link>

            <div className={classNames('side-nav-content flex-1', contentClass)}>
                {/* @ts-expect-error: ScrollBar typing does not declare children */}
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationConfig}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={roles}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav
