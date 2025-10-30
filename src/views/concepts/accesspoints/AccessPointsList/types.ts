// src/views/concepts/accesspoints/AccessPointsList/types.ts
import type { Control, FieldErrors } from 'react-hook-form'

/** Fila del listado de Access Points (hardware) */
export type AccessPoint = {
  id: string | number
  /** Nombre básico que podrías mapear desde backend; en la UI mostramos `full_name` si existe */
  name?: string
  /** Viene tal cual en tu JSON (p.ej. "HW La Foresta V") */
  full_name?: string
  email?: string
  phone?: string
  /** Mostrar EXACTO como viene del backend (p.ej. "Hardware") */
  role?: string
  community?: string
  active?: boolean
}

/** Respuesta de la API paginada */
export type GetAccessPointsListResponse = {
  list: AccessPoint[]
  total: number
}

/** Filtros del listado (si luego agregamos modal de filtros) */
export type Filter = {
  role?: string | ''        // '' = todos (p.ej. 'Hardware', 'Reader', etc.)
  active?: boolean | ''     // '' = todos
  communityId?: number | '' // '' = todas (el selector del header puede sobreescribir esto)
}

/** Schema del formulario Create/Edit de Access Point (si más adelante lo usamos) */
export type AccessPointsFormSchema = {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  role_id?: number | string
  community_id?: number | string
  active?: boolean
}

/** Props base para secciones del formulario (si las usas) */
export type FormSectionBaseProps = {
  control: Control<AccessPointsFormSchema>
  errors: FieldErrors<AccessPointsFormSchema>
}
