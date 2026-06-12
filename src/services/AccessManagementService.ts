import ApiService from './ApiService'
import { assertCsvUpload } from '@/utils/security/files'

export const WHITELISTS_BASE = '/api/v1/whitelists'
export const BLACKLISTS_BASE = '/api/v1/blacklists'
export const ACCESS_LOGS_BASE = '/api/v1/access-logs'

export type AccessScopeParams = {
    location_id?: number | string
    company_id?: number | string
}

export type AccessListEntry = {
    id: number | string
    company_id?: number | null
    location_id?: number | null
    external_people_id?: number | null
    id_number: string
    full_name: string
    reason?: string | null
    vehicle_plate?: string | null
    expiration_date?: string | null
    created_at?: string | null
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

export type AccessLogStatus = 'active' | 'completed' | 'all'

export type AccessLog = {
    id: number | string
    location_id: number
    external_people_id: number
    type_document?: string | null
    vehicle_plate?: string | null
    office?: string | null
    comment?: string | null
    entry_images?: string[] | null
    exit_date?: string | null
    exit_comment?: string | null
    exit_created_by?: number | null
    exit_images?: string[] | null
    created_by: number
    created_at: string
    custom_form_responses?: unknown
    external_people?: {
        id: number
        name: string
        id_number: string
        gender?: string | null
        file_name?: string | null
    } | null
}

export type AccessLogExitRequest = {
    exit_comment?: string | null
    exit_images?: string[] | null
    exit_date?: string | null
}

export type AccessLogBulkExitRequest = {
    access_log_ids: number[]
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
    status?: AccessLogStatus
    search_plate?: string
    search_name?: string
    search_dni?: string
}

function cleanId(value: string | number) {
    return encodeURIComponent(String(value).replace(/\/+$/, ''))
}

export async function apiGetWhitelist(params?: AccessListParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessListEntry>>({
        url: `${WHITELISTS_BASE}/`,
        method: 'get',
        params,
    })
}

export async function apiCreateWhitelist(data: WhitelistCreateRequest, params?: AccessScopeParams) {
    return ApiService.fetchDataWithAxios<AccessListEntry, WhitelistCreateRequest>({
        url: `${WHITELISTS_BASE}/`,
        method: 'post',
        params,
        data,
    })
}

export async function apiBulkImportWhitelist(locationId: string | number, file: File) {
    assertCsvUpload(file)
    const formData = new FormData()
    formData.append('file', file)

    return ApiService.fetchDataWithAxios<void, FormData>({
        url: `${WHITELISTS_BASE}/bulk`,
        method: 'post',
        params: { location_id: locationId },
        data: formData,
    })
}

export async function apiRevokeWhitelist(idNumber: string | number, params?: AccessScopeParams) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${WHITELISTS_BASE}/${cleanId(idNumber)}`,
        method: 'delete',
        params,
    })
}

export async function apiGetBlacklist(params?: AccessListParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessListEntry>>({
        url: `${BLACKLISTS_BASE}/`,
        method: 'get',
        params,
    })
}

export async function apiCreateBlacklist(data: BlacklistCreateRequest, params?: AccessScopeParams) {
    return ApiService.fetchDataWithAxios<AccessListEntry, BlacklistCreateRequest>({
        url: `${BLACKLISTS_BASE}/`,
        method: 'post',
        params,
        data,
    })
}

export async function apiBulkImportBlacklist(locationId: string | number, file: File) {
    assertCsvUpload(file)
    const formData = new FormData()
    formData.append('file', file)

    return ApiService.fetchDataWithAxios<void, FormData>({
        url: `${BLACKLISTS_BASE}/bulk`,
        method: 'post',
        params: { location_id: locationId },
        data: formData,
    })
}

export async function apiRemoveBlacklist(idNumber: string | number, params?: AccessScopeParams) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${BLACKLISTS_BASE}/${cleanId(idNumber)}`,
        method: 'delete',
        params,
    })
}

export async function apiGetAccessLogs(locationId: string | number, params?: AccessLogsParams) {
    return ApiService.fetchDataWithAxios<PageResponse<AccessLog>>({
        url: `${ACCESS_LOGS_BASE}/dashboard/${cleanId(locationId)}`,
        method: 'get',
        params,
    })
}

export async function apiRegisterAccessExit(
    accessLogId: string | number,
    data: AccessLogExitRequest = {},
) {
    return ApiService.fetchDataWithAxios<void, AccessLogExitRequest>({
        url: `${ACCESS_LOGS_BASE}/dashboard/${cleanId(accessLogId)}/exit`,
        method: 'patch',
        data,
    })
}

export async function apiRegisterBulkAccessExit(data: AccessLogBulkExitRequest) {
    return ApiService.fetchDataWithAxios<void, AccessLogBulkExitRequest>({
        url: `${ACCESS_LOGS_BASE}/dashboard/exit/bulk`,
        method: 'patch',
        data,
    })
}

const AccessManagementApi = {
    apiGetWhitelist,
    apiCreateWhitelist,
    apiBulkImportWhitelist,
    apiRevokeWhitelist,
    apiGetBlacklist,
    apiCreateBlacklist,
    apiBulkImportBlacklist,
    apiRemoveBlacklist,
    apiGetAccessLogs,
    apiRegisterAccessExit,
    apiRegisterBulkAccessExit,
}

export default AccessManagementApi
