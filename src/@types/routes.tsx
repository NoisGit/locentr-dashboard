import { LayoutType } from './theme'
import type { LazyExoticComponent, ReactNode, JSX, ComponentType } from 'react'
import type { Role, Permission } from '@/utils/rbac/types'

export type PageHeaderProps = {
    title?: string | ReactNode | LazyExoticComponent<() => JSX.Element>
    description?: string | ReactNode
    contained?: boolean
    extraHeader?: string | ReactNode | LazyExoticComponent<() => JSX.Element>
}

export interface Meta {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    pageBackgroundType?: 'default' | 'plain'
    header?: PageHeaderProps
    footer?: boolean
    layout?: LayoutType
}

/**
 * Configuración de ruta con soporte RBAC
 * @deprecated authority - Use 'roles' y 'permissions' en su lugar
 */
export type Route = {
    key: string
    path: string
    component: LazyExoticComponent<ComponentType>

    /**
     * @deprecated Use 'roles' en su lugar
     */
    authority?: string[]

    /**
     * Roles permitidos para acceder a esta ruta (Sistema RBAC)
     */
    roles?: Role[]

    /**
     * Permisos requeridos para acceder a esta ruta (Sistema RBAC)
     */
    permissions?: Permission[]

    /**
     * Si true, requiere TODOS los permisos. Si false, requiere al menos uno
     * @default true
     */
    requireAllPermissions?: boolean

    meta?: Meta
}

export type Routes = Route[]
