import useSWR from 'swr'
import { apiGetAllSupportTickets } from '@/services/SupportTicketsService'
import type { SupportTicketStatus } from '@/services/SupportTicketsService'

type UseSupportTicketsListParams = {
    pageIndex: number
    pageSize: number
    status?: SupportTicketStatus
}

export default function useSupportTicketsList({
    pageIndex,
    pageSize,
    status,
}: UseSupportTicketsListParams) {
    return useSWR(
        ['support-tickets:list', pageIndex, pageSize, status],
        () =>
            apiGetAllSupportTickets({
                page: pageIndex,
                size: pageSize,
                status,
            }),
        { revalidateOnFocus: false },
    )
}
