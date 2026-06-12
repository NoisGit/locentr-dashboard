import classNames from 'classnames'
import locentrLogo from '@/assets/locentr-logo.svg'
import locentrLogoDark from '@/assets/locentr-logo-dark.svg'
import locentrIcon from '@/assets/locentr-icon.svg'

import { useThemeStore } from '@/store/themeStore'
import { APP_NAME } from '@/constants/app.constant'
import { Link } from 'react-router-dom'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import ScrollBar from '@/components/ui/ScrollBar'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
} from '@/constants/theme.constant'

import { useAuth } from '@/auth'

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

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    contentClass,
}: SideNavProps) => {
    const direction = useThemeStore((state) => state.direction)
    const mode = useThemeStore((state) => state.mode)
    const sideNavCollapse = useThemeStore((state) => state.layout.sideNavCollapse)
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const { user } = useAuth()

    const logoSrc = sideNavCollapse
        ? locentrIcon
        : mode === 'dark'
          ? locentrLogoDark
          : locentrLogo

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
                className="side-nav-header flex h-[64px] w-full items-center justify-center px-3"
            >
                <img
                    src={logoSrc}
                    alt={`${APP_NAME} logo`}
                    className={sideNavCollapse ? 'max-h-[30px]' : 'max-h-[32px] max-w-[136px]'}
                    style={{ margin: '0 auto', display: 'block', objectFit: 'contain' }}
                    draggable={false}
                />
            </Link>

            <div className={classNames('side-nav-content flex-1', contentClass)}>
                <ScrollBar style={{ height: '100%' }} direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationConfig}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={user}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav
