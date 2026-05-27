import useSWR from 'swr'
import { apiListAuditLogs } from '@/services/AuditLogService'

export function useAuditLog() {
    return useSWR(
        ['audit-log:list'],
        () => apiListAuditLogs({ page: 1, size: 10 }),
        { revalidateOnFocus: false },
    )
}
