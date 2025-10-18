import ApiService from './ApiService'

export async function apiGetPerksList<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/perks',
        method: 'get',
        params,
    })
}

export async function apiGetPerk<T, U extends Record<string, unknown>>({
    id,
    ...params
}: U & { id: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: `/perks/${id}`,
        method: 'get',
        params,
    })
}
