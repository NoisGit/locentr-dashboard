// src/components/template/SideNav.tsx
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
import { useMemo } from 'react'

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

/** Claves del navigation.config a ocultar para ADMIN/SUBADMIN/USER */
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
  'concepts.products',     //Amenidades
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

/** Normaliza cualquier forma de authority a un Set<string> en MAYÚSCULAS */
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
      // Soporta estructuras: {name:'superadmin'}, {role:'ADMIN'}, {authority:'SubAdmin'}
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
  const themeMode = useThemeStore((state) => state.mode)
  const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)
  const rawAuthority = useSessionUser((state) => state.user.authority)

  const roles = useMemo(() => normalizeAuthority(rawAuthority), [rawAuthority])
  const isSuperAdmin = roles.has('SUPERADMIN')
  const isSubAdmin = roles.has('SUBADMIN')
  const isAdmin = roles.has('ADMIN') || roles.has('USER')

  const navigationFiltered = useMemo(() => {
    if (isSuperAdmin) return navigationConfig
    if (isAdmin || isSubAdmin) {
      return filterTreeByKeys(
        navigationConfig as NavNode[],
        HIDE_KEYS_FOR_ADMIN_GROUP,
      )
    }
    // Cualquier otro perfil: mismo filtro visual
    return filterTreeByKeys(
      navigationConfig as NavNode[],
      HIDE_KEYS_FOR_ADMIN_GROUP,
    )
  }, [isSuperAdmin, isAdmin, isSubAdmin])

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
