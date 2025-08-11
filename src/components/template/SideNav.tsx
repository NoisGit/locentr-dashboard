import classNames from 'classnames'
import porteriaBlack from '@/assets/porteria-black.svg'
import porteriaWhite from '@/assets/porteria-white.svg'
import porteriaIcon from '@/assets/porteria-icon.svg'
import porteriaGrey from '@/assets/porteria-grey.svg'

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
}) => {
    const direction = useThemeStore((state) => state.direction)
    const sideNavCollapse = useThemeStore((state) => state.layout.sideNavCollapse)
    const themeMode = useThemeStore((state) => state.mode)
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const userAuthority = useSessionUser((state) => state.user.authority)

    let logoSrc = themeMode === 'dark' ? porteriaWhite : porteriaBlack
    if (sideNavCollapse) {
        logoSrc = porteriaIcon
    }

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
                className={
                    sideNavCollapse
                        ? 'side-nav-header flex items-center justify-center w-full h-[90px]'
                        : 'side-nav-header flex items-center justify-center w-full h-[90px]'
                }
            >
                <img
                    src={logoSrc}
                    alt={`${APP_NAME} logo`}
                    className={sideNavCollapse ? 'max-h-[38px]' : 'max-h-[40px]'}
                    style={{
                        margin: '0 auto',
                        display: 'block',
                        objectFit: 'contain',
                    }}
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
                        userAuthority={userAuthority || []}
                    />
                </ScrollBar>
            </div>

            {/* Marca de agua SIEMPRE visible en celular también */}
            {!sideNavCollapse && (
                <div className="p-4 mt-4 shrink-0">
                    <img
                        src={porteriaGrey}
                        alt="Porteria watermark"
                        className="w-36 mx-auto opacity-20"
                        draggable={false}
                    />
                </div>
            )}
        </div>
    )
}

export default SideNav
