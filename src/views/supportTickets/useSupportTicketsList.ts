import useSWR from 'swr'
import { apiGetAllSupportTickets } from '@/services/SupportTicketsService'

export default function useSupportTicketsList() {
    const { data, error, isLoading, mutate } = useSWR(
        'supportTickets:list',
        () => apiGetAllSupportTickets({ page: 1, size: 10 }),
        { revalidateOnFocus: false },
    )

    return {
        tickets: data?.items || data?.list || [],
        total: data?.total || 0,
        error,
        isLoading,
        mutate,
    }
}
