import ApiService from './ApiService'

export type AccessListEntry = {
    id?: string | number
    id_number?: string
    full_name?: string
    name?: string
    plate?: string
    location_id?: number
    company_id?: number
    created_at?: string
    expires_at?: string
}

export type AccessLog = {
    id: string | number
    full_name?: string
    name?: string
    id_number?: string
    plate?: string
    status?: string
    entry_at?: string
    exit_at?: string
    created_at?: string
}

export type PageResponse<T> = {
    items?: T[]
    list?: T[]
    total?: number
}

export type AccessListParams = {
    page?: number
    size?: number
    location_id?: number | string
    company_id?: number | string
    search?: string
    include_expired?: boolean
}

export type AccessLogsParams = {
    page?: number
    size?: number
    start_date?: string
    end_date?: string
    status?: 'active' | 'completed' | 'all'
    search_plate?: string
    search_name?: string
    search_dni?: string
}

export async function apiGetWhitelist(params?: AccessListParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessListEntry>>({
        url: '/api/v1/whitelists/',
        method: 'get',
        params,
    })
}

export async function apiGetBlacklist(params?: AccessListParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessListEntry>>({
        url: '/api/v1/blacklists/',
        method: 'get',
        params,
    })
}

export async function apiGetAccessLogs(locationId: string | number, params?: AccessLogsParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessLog>>({
        url: `/api/v1/access-logs/dashboard/${locationId}`,
        method: 'get',
        params,
    })
}

export async function apiRegisterAccessExit(
    accessLogId: string | number,
    data: Record<string, unknown> = {},
) {
    return ApiService.fetchDataWithAxios({
        url: `/api/v1/access-logs/dashboard/${accessLogId}/exit`,
        method: 'patch',
        data,
    })
}
