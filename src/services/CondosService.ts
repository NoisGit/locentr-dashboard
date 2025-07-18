import ApiService from './ApiService'

export async function apiGetCondosList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/condos',
        method: 'get',
        params,
    })
}

export async function apiGetCondo<T>(id: string | number) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/condos/${id}`,
        method: 'get',
    })
}
