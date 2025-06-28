import ApiService from './ApiService'

export async function apiGetAccessList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/access',
        method: 'get',
        params,
    })
}

export async function apiGetAccess<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/access/${id}`,
        method: 'get',
        params,
    })
}

export async function apiGetAccessLog<T, U extends Record<string, unknown>>({
    ...params
}: U) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/access/log`,
        method: 'get',
        params,
    })
}

