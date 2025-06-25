import ApiService from './ApiService'

// Get paginated logbook entries
export async function apiGetLogbookList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/api/logbook',
        method: 'get',
        params,
    })
}

// Get a single logbook entry by ID
export async function apiGetLogbookEntry<T, U extends Record<string, unknown>>(
    params: U & { id: string }
) {
    const { id, ...otherParams } = params
    return ApiService.fetchDataWithAxios<T>({
        url: `/api/logbook/${id}`,
        method: 'get',
        params: otherParams,
    })
}
