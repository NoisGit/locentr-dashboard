import type { Control, FieldErrors } from 'react-hook-form'

/** Fila del listado de colaboradores */
export type Collaborator = {
  id: string | number
  name: string
  email?: string
  phone?: string
  role?: string
  community?: string
  active?: boolean
}

/** Respuesta de la API paginada */
export type GetCollaboratorsListResponse = {
  list: Collaborator[]
  total: number
}

/** Filtros del listado (si luego agregamos modal de filtros) */
export type Filter = {
  role?: string | ''          // '' = todos, o nombre del rol ('ADMIN','SUBADMIN','CONSERJE','GUARDIA', etc.)
  active?: boolean | ''       // '' = todos
  communityId?: number | ''   // '' = todas (el selector del header puede sobreescribir esto)
}

/** Schema del formulario Create/Edit de Colaborador (por si más adelante lo usamos) */
export type CollaboratorsFormSchema = {
  full_name?: string
  email?: string
  phone?: string
  password?: string
  role_id?: number | string
  community_id?: number | string
}

/** Props base para secciones del formulario (si las usas) */
export type FormSectionBaseProps = {
  control: Control<CollaboratorsFormSchema>
  errors: FieldErrors<CollaboratorsFormSchema>
}
