import ApiService from './ApiService'

export type AccessScopeParams = {
    location_id?: number | string
    company_id?: number | string
}

export type AccessListEntry = {
    id?: string | number
    id_number?: string
    full_name?: string
    name?: string
    plate?: string
    reason?: string | null
    vehicle_plate?: string | null
    location_id?: number | null
    company_id?: number | null
    external_people_id?: number | null
    created_at?: string | null
    expiration_date?: string | null
    expires_at?: string | null
}

export type WhitelistCreateRequest = {
    id_number: string
    full_name: string
    reason?: string | null
    vehicle_plate?: string | null
    expiration_date?: string | null
}

export type BlacklistCreateRequest = {
    id_number: string
    full_name: string
    reason: string
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
    page?: number
    size?: number
    pages?: number
}

export type AccessListParams = AccessScopeParams & {
    page?: number
    size?: number
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

function cleanId(value: string | number) {
    return encodeURIComponent(String(value).replace(/\/+$/, ''))
}

export async function apiGetWhitelist(params?: AccessListParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessListEntry>>({
        url: '/api/v1/whitelists/',
        method: 'get',
        params,
    })
}

export async function apiCreateWhitelist(
    data: WhitelistCreateRequest,
    params?: AccessScopeParams,
) {
    return ApiService.fetchDataWithAxios<AccessListEntry, WhitelistCreateRequest>({
        url: '/api/v1/whitelists/',
        method: 'post',
        params,
        data,
    })
}

export async function apiRevokeWhitelist(
    idNumber: string | number,
    params?: AccessScopeParams,
) {
    return ApiService.fetchDataWithAxios<void>({
        url: `/api/v1/whitelists/${cleanId(idNumber)}`,
        method: 'delete',
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

export async function apiCreateBlacklist(
    data: BlacklistCreateRequest,
    params?: AccessScopeParams,
) {
    return ApiService.fetchDataWithAxios<AccessListEntry, BlacklistCreateRequest>({
        url: '/api/v1/blacklists/',
        method: 'post',
        params,
        data,
    })
}

export async function apiRemoveBlacklist(
    idNumber: string | number,
    params?: AccessScopeParams,
) {
    return ApiService.fetchDataWithAxios<void>({
        url: `/api/v1/blacklists/${cleanId(idNumber)}`,
        method: 'delete',
        params,
    })
}

export async function apiGetAccessLogs(locationId: string | number, params?: AccessLogsParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessLog>>({
        url: `/api/v1/access-logs/dashboard/${cleanId(locationId)}`,
        method: 'get',
        params,
    })
}

export async function apiRegisterAccessExit(
    accessLogId: string | number,
    data: Record<string, unknown> = {},
) {
    return ApiService.fetchDataWithAxios<void, Record<string, unknown>>({
        url: `/api/v1/access-logs/dashboard/${cleanId(accessLogId)}/exit`,
        method: 'patch',
        data,
    })
}

const AccessManagementApi = {
    apiGetWhitelist,
    apiCreateWhitelist,
    apiRevokeWhitelist,
    apiGetBlacklist,
    apiCreateBlacklist,
    apiRemoveBlacklist,
    apiGetAccessLogs,
    apiRegisterAccessExit,
}

export default AccessManagementApi
