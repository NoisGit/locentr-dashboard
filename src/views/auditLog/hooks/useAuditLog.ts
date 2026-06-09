import useSWR from 'swr'
import { apiListAuditLogs } from '@/services/AuditLogService'

type UseAuditLogParams = {
    pageIndex: number
    pageSize: number
}

export function useAuditLog({ pageIndex, pageSize }: UseAuditLogParams) {
    return useSWR(
        ['audit-log:list', pageIndex, pageSize],
        () => apiListAuditLogs({ page: pageIndex, size: pageSize }),
        { revalidateOnFocus: false },
    )
}
