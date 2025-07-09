import ApiService from './ApiService'

export async function apiGetEntryList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/entries',
        method: 'get',
        params,
    })
}

export async function apiGetEntry<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/entries/${id}`,
        method: 'get',
        params,
    })
}

export async function apiGetEntryLog<T, U extends Record<string, unknown>>({
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/entries/log`,
        method: 'get',
        params,
    })
}
