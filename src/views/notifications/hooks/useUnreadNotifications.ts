import useSWR from 'swr'
import { apiGetUnreadNotifications } from '@/services/NotificationsService'

export function useUnreadNotifications() {
    return useSWR(
        ['notifications:unread'],
        () => apiGetUnreadNotifications({ page: 1, size: 10 }),
        { revalidateOnFocus: false },
    )
}
