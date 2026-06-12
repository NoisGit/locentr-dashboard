import ApiService from '@/services/ApiService'

export const NOTIFICATIONS_BASE = '/api/v1/notifications'

export type NotificationCreateRequest = {
    title: string
    message: string
}

export type NotificationSendResponse = {
    success: number
    failed: number
}

export type NotificationMessage = {
    id: number
    title: string
    message: string
    read_at?: string | null
    created_at?: string | null
}

export type PaginatedResponse<T> = {
    items?: T[]
    total?: number
    page?: number
    size?: number
    pages?: number
}

export type ListUnreadNotificationsParams = {
    page?: number
    size?: number
}

export async function apiSendNotificationToAllUsers(data: NotificationCreateRequest) {
    return ApiService.fetchDataWithAxios<NotificationSendResponse, NotificationCreateRequest>({
        url: `${NOTIFICATIONS_BASE}/send-all-users`,
        method: 'post',
        data,
    })
}

export async function apiGetUnreadNotifications(
    params: ListUnreadNotificationsParams = {},
) {
    return ApiService.fetchDataWithAxios<PaginatedResponse<NotificationMessage>>({
        url: `${NOTIFICATIONS_BASE}/me/unread`,
        method: 'get',
        params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
        },
    })
}

export async function apiMarkNotificationAsRead(notificationId: string | number) {
    return ApiService.fetchDataWithAxios<void>({
        url: `${NOTIFICATIONS_BASE}/me/mark-read/${encodeURIComponent(String(notificationId))}`,
        method: 'put',
    })
}

const NotificationsApi = {
    apiSendNotificationToAllUsers,
    apiGetUnreadNotifications,
    apiMarkNotificationAsRead,
}

export default NotificationsApi
