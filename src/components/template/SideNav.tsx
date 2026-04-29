import classNames from 'classnames'
import coredeckLogo from '@/assets/coredeck-logo.svg'
import coredeckIcon from '@/assets/coredeck-icon.svg'

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

const HIDE_KEYS_FOR_ADMIN_GROUP = new Set<string>([
  'dashboard',
  'concepts.ai',
  'concepts.customers',
  'concepts.accesses',
  'concepts.perks',
  'concepts.marketplace',
  'concepts.condosAdmin',
  'concepts.plan',
  'concepts.chat',
  'concepts.calendar',
  'concepts.products',
  'concepts.properties',
  'concepts.residents',
])

const SUPERADMIN_ALLOWED_KEYS = new Set<string>([
  'concepts.customers',
  'concepts.news',
  'concepts.incidents.list',
  'concepts.entries',
  'concepts.mailbox',
  'concepts.invitations',
  'concepts.logbook',
  'concepts.condos',
])

type NavNode = (typeof navigationConfig)[number]

function filterTreeByKeys(nodes: NavNode[], hideKeys: Set<string>): NavNode[] {
  const out: NavNode[] = []
  for (const n of nodes) {
    if (hideKeys.has(n.key)) continue
    let subMenu = n.subMenu ?? []
    if (subMenu.length) {
      subMenu = filterTreeByKeys(subMenu as NavNode[], hideKeys)
    }
    out.push({ ...n, subMenu } as NavNode)
  }
  return out
}

function filterTreeByWhitelist(nodes: NavNode[], allow: Set<string>): NavNode[] {
  const out: NavNode[] = []
  for (const n of nodes) {
    const filteredChildren = n.subMenu
      ? filterTreeByWhitelist(n.subMenu as NavNode[], allow)
      : []
    const keep = allow.has(n.key) || filteredChildren.length > 0
    if (!keep) continue
    out.push({ ...n, subMenu: filteredChildren } as NavNode)
  }
  return out
}

function normalizeAuthority(authority: unknown): Set<string> {
  const roles = new Set<string>()
  const add = (v: unknown) => {
    if (v == null) return
    if (typeof v === 'string') {
      roles.add(v.toUpperCase())
      return
    }
    if (typeof v === 'number') {
      roles.add(String(v))
      return
    }
    if (Array.isArray(v)) {
      v.forEach(add)
      return
    }
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>
      const byName =
        (typeof o.name === 'string' && o.name) ||
        (typeof o.role === 'string' && o.role) ||
        (typeof o.authority === 'string' && o.authority)
      if (byName) {
        roles.add(String(byName).toUpperCase())
      }
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
    const s = normalizeAuthority(rawAuthority)
    if (effectiveRole) s.add(effectiveRole.toUpperCase())
    if (s.size === 0) s.add('USER')
    return s
  }, [rawAuthority, effectiveRole])

  const isSuperAdmin = roles.has('SUPERADMIN')
  const isSubAdmin = roles.has('SUBADMIN')
  const isAdmin = roles.has('ADMIN') || roles.has('USER')

  const navigationFiltered = useMemo(() => {
    if (isSuperAdmin) {
      return filterTreeByWhitelist(navigationConfig as NavNode[], SUPERADMIN_ALLOWED_KEYS)
    }
    if (isAdmin || isSubAdmin) {
      return filterTreeByKeys(navigationConfig as NavNode[], HIDE_KEYS_FOR_ADMIN_GROUP)
    }
    return filterTreeByKeys(navigationConfig as NavNode[], HIDE_KEYS_FOR_ADMIN_GROUP)
  }, [isSuperAdmin, isAdmin, isSubAdmin])

  const logoSrc = sideNavCollapse ? coredeckIcon : coredeckLogo

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
          style={{ margin: '0 auto', display: 'block', objectFit: 'contain' }}
          draggable={false}
        />
      </Link>

      <div className={classNames('side-nav-content flex-1', contentClass)}>
        {/* @ts-expect-error: ScrollBar typing no declara children */}
        <ScrollBar style={{ height: '100%' }} direction={direction}>
          <VerticalMenuContent
            collapsed={sideNavCollapse}
            navigationTree={navigationFiltered}
            routeKey={currentRouteKey}
            direction={direction}
            translationSetup={translationSetup}
            userAuthority={[...roles]}
          />
        </ScrollBar>
      </div>
    </div>
  )
}

export default SideNav
