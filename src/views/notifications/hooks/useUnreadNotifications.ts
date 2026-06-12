import useSWR from 'swr'
import { apiGetUnreadNotifications } from '@/services/NotificationsService'

type UseUnreadNotificationsParams = {
    pageIndex: number
    pageSize: number
}

export function useUnreadNotifications({
    pageIndex,
    pageSize,
}: UseUnreadNotificationsParams) {
    return useSWR(
        ['notifications:unread', pageIndex, pageSize],
        () => apiGetUnreadNotifications({ page: pageIndex, size: pageSize }),
        { revalidateOnFocus: false },
    )
}
