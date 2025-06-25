// ======== TIPOS PARA LOGBOOK ========

// Tipo principal para los ítems del logbook (para tabla, mocks, etc.)
export type LogbookItem = {
    id: string
    title: string
    description: string
    date: string
    responsible: string
    tags: string[]
    files: { id: string; name: string; url: string }[]
    status: number           // Usa number para que coincida con tus mocks y la tabla
    img?: string
    imgList?: { id: string; name: string; img: string }[]
    [key: string]: any  
}

// Tipo de formulario para crear/editar (compatibles con LogbookForm)
export type LogbookFormSchema = {
    title: string
    description: string
    date: string
    responsible: string
    tags: string[]
    files: { id: string; name: string; url: string }[]
}

// Props base para usar con react-hook-form en tus componentes de formulario
import type { Control, FieldErrors } from 'react-hook-form'
export type FormSectionBaseProps = {
    control: Control<LogbookFormSchema>
    errors: FieldErrors<LogbookFormSchema>
}

// Tipo para filtros de listado (por si necesitas buscar, filtrar, etc)
export type LogbookFilter = {
    status?: string | number
    tag?: string
    responsible?: string
    fromDate?: string
    toDate?: string
    query?: string
}

// Respuesta paginada para listados (API fake o real)
export type GetLogbookListResponse = {
    list: LogbookItem[]
    total: number
}
