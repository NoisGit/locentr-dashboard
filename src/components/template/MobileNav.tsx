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
import { useAuth } from '@/auth'
import Logo from '@/components/template/Logo'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent'),
)

type MobileNavToggleProps = { toggled?: boolean }
type MobileNavProps = { translationSetup?: boolean }

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const MobileNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const handleOpenDrawer = () => setIsOpen(true)
    const handleDrawerClose = () => setIsOpen(false)

    const direction = useThemeStore((s) => s.direction)
    const mode = useThemeStore((s) => s.mode)
    const currentRouteKey = useRouteKeyStore((s) => s.currentRouteKey)
    const { user } = useAuth()

    return (
        <>
            <div className="text-2xl" onClick={handleOpenDrawer}>
                <MobileNavToggle toggled={isOpen} />
            </div>
            <Drawer
                title={<Logo logoWidth={145} mode={mode} />}
                isOpen={isOpen}
                bodyClass={classNames('p-0')}
                width={280}
                placement={direction === DIR_RTL ? 'right' : 'left'}
                onClose={handleDrawerClose}
                onRequestClose={handleDrawerClose}
            >
                <Suspense fallback={<></>}>
                    {isOpen && (
                        <div className="flex flex-col h-full">
                            <VerticalMenuContent
                                collapsed={false}
                                navigationTree={navigationConfig}
                                routeKey={currentRouteKey}
                                userAuthority={user}
                                direction={direction}
                                translationSetup={translationSetup}
                                onMenuItemClick={handleDrawerClose}
                            />
                        </div>
                    )}
                </Suspense>
            </Drawer>
        </>
    )
}

export default MobileNav
