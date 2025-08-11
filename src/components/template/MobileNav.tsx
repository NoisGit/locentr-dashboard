import { useState, Suspense, lazy } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import NavToggle from '@/components/shared/NavToggle'
import { DIR_RTL } from '@/constants/theme.constant'
import withHeaderItem, { WithHeaderItemProps } from '@/utils/hoc/withHeaderItem'
import navigationConfig from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import { useThemeStore } from '@/store/themeStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import { useSessionUser } from '@/store/authStore'
import Logo from '@/components/template/Logo'

// Marca de agua
import porteriaGrey from '@/assets/porteria-grey.svg'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent'),
)

type MobileNavToggleProps = {
    toggled?: boolean
}

type MobileNavProps = {
    translationSetup?: boolean
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const MobileNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenDrawer = () => {
        setIsOpen(true)
    }

    const handleDrawerClose = () => {
        setIsOpen(false)
    }

    const direction = useThemeStore((state) => state.direction)
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
    const userAuthority = useSessionUser((state) => state.user.authority)

    return (
        <>
            <div className="text-2xl" onClick={handleOpenDrawer}>
                <MobileNavToggle toggled={isOpen} />
            </div>
            <Drawer
                title={<Logo logoWidth={160} />}
                isOpen={isOpen}
                bodyClass={classNames('p-0')}
                width={330}
                placement={direction === DIR_RTL ? 'right' : 'left'}
                onClose={handleDrawerClose}
                onRequestClose={handleDrawerClose}
            >
                <Suspense fallback={<></>}>
                    {isOpen && (
                        <div className="flex flex-col justify-between h-full">
                            <VerticalMenuContent
                                collapsed={false}
                                navigationTree={navigationConfig}
                                routeKey={currentRouteKey}
                                userAuthority={userAuthority as string[]}
                                direction={direction}
                                translationSetup={translationSetup}
                                onMenuItemClick={handleDrawerClose}
                            />

                            {/* Marca de agua visible en móvil */}
                            <div className="p-4 mt-4 shrink-0">
                                <img
                                    src={porteriaGrey}
                                    alt="Porteria watermark"
                                    className="w-36 mx-auto opacity-20"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    )}
                </Suspense>
            </Drawer>
        </>
    )
}

export default MobileNav
