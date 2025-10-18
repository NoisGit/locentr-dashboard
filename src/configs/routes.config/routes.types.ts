// src/configs/routes.config/routes.types.ts

import { LazyExoticComponent, ComponentType } from 'react'
import { Permission, Role } from '@/utils/rbac/types'

/**
 * Tipo de layout para la ruta
 */
export type RouteLayout = 'default' | 'blank' | 'collapsible-side' | 'simple'

/**
 * Tipo de contenedor para la página
 */
export type PageContainerType = 'contained' | 'gutterless' | 'default'

/**
 * Tipo de fondo para la página
 */
export type PageBackgroundType = 'plain' | 'default'

/**
 * Metadata de la ruta
 */
export interface RouteMeta {
    /**
     * Layout a usar para esta ruta
     */
    layout?: RouteLayout

    /**
     * Tipo de contenedor de página
     */
    pageContainerType?: PageContainerType

    /**
     * Tipo de fondo de página
     */
    pageBackgroundType?: PageBackgroundType

    /**
     * Si false, oculta el footer
     */
    footer?: boolean

    /**
     * Si false, oculta el header
     */
    header?: boolean

    /**
     * Header personalizado para esta ruta
     */
    customHeader?: {
        title?: string
        description?: string
        contained?: boolean
        extraHeader?: LazyExoticComponent<ComponentType<unknown>>
    }

    /**
     * Datos adicionales personalizados
     */
    [key: string]: unknown
}

/**
 * Configuración de una ruta
 */
export interface RouteConfig {
    /**
     * Key única de la ruta
     */
    key: string

    /**
     * Path de la ruta
     */
    path: string

    /**
     * Componente a renderizar (lazy loaded)
     */
    component: LazyExoticComponent<ComponentType<unknown>>

    /**
     * Roles permitidos para acceder a esta ruta
     * Si está vacío, cualquier usuario autenticado puede acceder
     */
    roles?: Role[]

    /**
     * Permisos requeridos para acceder a esta ruta
     * Si está vacío, solo se validan los roles
     */
    permissions?: Permission[]

    /**
     * Si true, requiere TODOS los permisos. Si false, al menos uno
     * @default true
     */
    requireAllPermissions?: boolean

    /**
     * Metadata adicional de la ruta
     */
    meta?: RouteMeta

    /**
     * Rutas hijas (para rutas anidadas)
     */
    children?: RouteConfig[]
}

/**
 * Lista de configuraciones de rutas
 */
export type Routes = RouteConfig[]
