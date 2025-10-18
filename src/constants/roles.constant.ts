// src/constants/roles.constant.ts

/** ----------------------- Definición de Roles ----------------------- **/
export const SUPERADMIN = 'SUPERADMIN'
export const ADMIN = 'ADMIN'
export const SUBADMIN = 'SUBADMIN'
export const USER = 'USER'

/** 
 * Grupo que agrupa a los roles administrativos "comunes".
 * Usado para filtrar vistas o limitar accesos.
 * Incluye ADMIN, SUBADMIN y USER.
 */
export const ADMIN_GROUP = [ADMIN, SUBADMIN, USER] as const

/**
 * Conjunto de todos los roles posibles de la aplicación.
 */
export const ALL_ROLES = [SUPERADMIN, ADMIN, SUBADMIN, USER] as const

/** ----------------------- Tipos ----------------------- **/

export type Role =
  | typeof SUPERADMIN
  | typeof ADMIN
  | typeof SUBADMIN
  | typeof USER

export type AdminGroupRole = (typeof ADMIN_GROUP)[number]

/**
 * Helper: retorna true si el rol pertenece al grupo administrativo.
 */
export const isAdminGroupRole = (role: string): boolean =>
  ADMIN_GROUP.includes(role.toUpperCase() as AdminGroupRole)

/**
 * Helper: retorna true si el rol es SUPERADMIN.
 */
export const isSuperAdmin = (role: string): boolean =>
  role?.toUpperCase() === SUPERADMIN
