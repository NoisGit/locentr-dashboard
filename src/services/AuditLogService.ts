import ApiService from '@/services/ApiService'

export const AUDIT_LOG_BASE = '/api/v1/audit-log'

export type AuditLogEntry = {
    id: number
    user_name: string
    action: string
    table_name?: string | null
    record_id?: number | null
    description?: string | null
    created_at: string
}

export type PaginatedResponse<T> = {
    items?: T[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type ListAuditLogsParams = {
    page?: number
    size?: number
}

export async function apiListAuditLogs(params: ListAuditLogsParams = {}) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<AuditLogEntry>>({
        url: AUDIT_LOG_BASE,
        method: 'get',
        params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
        },
    })
}

const AuditLogApi = {
    apiListAuditLogs,
}

export default AuditLogApi
