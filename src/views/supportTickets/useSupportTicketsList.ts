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
    const { data, error, isLoading, mutate } = useSWR(
        ['support-tickets:list', pageIndex, pageSize, status],
        () => apiGetAllSupportTickets({ page: pageIndex, size: pageSize, status }),
        { revalidateOnFocus: false },
    )

    return {
        tickets: data?.items ||