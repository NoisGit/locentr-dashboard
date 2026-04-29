import { useState, Suspense, lazy, useMemo } from 'react'
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
import { RBAC } from '@/utils/rbac/rbacCore'
import type { NavigationTree } from '@/@types/navigation'
import Logo from '@/components/template/Logo'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent'),
)

type MobileNavToggleProps = { toggled?: boolean }
type MobileNavProps = { translationSetup?: boolean }

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const SUPERADMIN_ALLOWED_KEYS = new Set<string>([
    'concepts.news',
    'concepts.incidents.list',
    'concepts.entries',
    'concepts.mailbox',
    'concepts.invitations',
    'concepts.logbook',
    'concepts.condos',
    'concepts.customers',
])

function filterNavForSuperAdmin(tree: NavigationTree[]): NavigationTree[] {
    const walk = (nodes: NavigationTree[]): NavigationTree[] =>
        nodes
            .map((n) => {
                const sub = n.subMenu ? walk(n.subMenu) : []
                const keep = SUPERADMIN_ALLOWED_KEYS.has(n.key) || sub.length > 0
                return keep ? { ...n, subMenu: sub } : null
            })
            .filter(Boolean) as NavigationTree[]
    return walk(tree)
}

function removeKeysFromTree(
    nodes: NavigationTree[],
    keysToRemove: Set<string>,
): NavigationTree[] {
    const out: NavigationTree[] = []
    for (const n of nodes) {
        if (keysToRemove.has(n.key)) continue
        const children = n.subMenu ? removeKeysFromTree(n.subMenu, keysToRemove) : []
        out.push({ ...n, subMenu: children })
    }
    return out
}

const MobileNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const handleOpenDrawer = () => setIsOpen(true)
    const handleDrawerClose = () => setIsOpen(false)

    const direction = useThemeStore((s) => s.direction)
    const currentRouteKey = useRouteKeyStore((s) => s.currentRouteKey)

    const { user } = useAuth()
    const role = RBAC.extractUserRole(user)

    const userAuthority: string[] = role ? [role] : []

    const ALWAYS_HIDE = useMemo(
        () => new Set<string>(['concepts.properties', 'concepts.residents']),
        [],
    )

    const navTree = useMemo(() => {
        const base =
            role === 'SUPERADMIN'
                ? filterNavForSuperAdmin(navigationConfig)
                : navigationConfig
        return removeKeysFromTree(base, ALWAYS_HIDE)
    }, [role, ALWAYS_HIDE])

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
                        <div className="flex flex-col h-full">
                            <VerticalMenuContent
                                collapsed={false}
                                navigationTree={navTree}
                                routeKey={currentRouteKey}
                                userAuthority={userAuthority}
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
