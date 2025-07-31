import ApiService from './ApiService'

/**
 * Obtener listado general de tickets (vista pública o para usuarios normales)
 */
export async function apiGetHelpTickets<T, U extends Record<string, unknown>>(params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/helps/list', // ✅ corregido
        method: 'get',
        params,
    })
}

/**
 * Obtener detalle de ticket por ID (vista detalle para responder)
 */
export async function apiGetHelpTicketById<T>(id: string | number) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/helps/ticket/${id}`, // ✅ corregido
        method: 'get',
    })
}

/**
 * Obtener lista de tickets para panel de administración (filtros, paginación, orden)
 */
export async function apiGetHelpManageList<T, U extends Record<string, unknown>>(params: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/helps/manage/list', // ✅ corregido
        method: 'get',
        params,
    })
}
