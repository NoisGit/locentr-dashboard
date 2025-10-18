import type { Control, FieldErrors } from 'react-hook-form'

/** Fila del listado (alineado con Residents service) */
export type Resident = {
  id: string | number
  userId: string | number
  propertyId: string | number
  userName?: string
  propertyName?: string
  isOwner?: boolean
  startDate?: string   // YYYY-MM-DD
  endDate?: string     // YYYY-MM-DD | undefined
  img?: string
  status?: string
}

/** Respuesta de la API paginada */
export type GetResidentsListResponse = {
  list: Resident[]
  total: number
}

/** Filtros del listado */
export type Filter = {
  propertyId: number | ''    // '' = todos
  userId: number | ''        // '' = todos
  isOwner: boolean | ''      // '' = todos, true/false = filtrar
  startDateFrom?: string     // YYYY-MM-DD
  endDateTo?: string         // YYYY-MM-DD
}

/** Schema del formulario Create/Edit de Resident */
export type ResidentsFormSchema = {
  user_id: number | string
  property_id: number | string
  is_owner?: boolean
  start_date?: string        // YYYY-MM-DD
  end_date?: string          // YYYY-MM-DD
}

/** Props base para secciones del formulario (si las usas) */
export type FormSectionBaseProps = {
  control: Control<ResidentsFormSchema>
  errors: FieldErrors<ResidentsFormSchema>
}
