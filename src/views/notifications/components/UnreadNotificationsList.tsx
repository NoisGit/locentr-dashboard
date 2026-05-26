import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatNotificationDate } from '../utils'
import type { NotificationMessage } from '@/services/NotificationsService'

type UnreadNotificationsListProps = {
    notifications: NotificationMessage[]
    onMarkAsRead: (notificationId: number) => void
}

const UnreadNotificationsList = ({
    notifications,
    onMarkAsRead,
}: UnreadNotificationsListProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h5>Unread notifications</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notifications waiting for your review.
                    </p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex flex-col gap-3 py-4 lg:flex-row lg:items-start lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="font-medium">{notification.title}</div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {notification.message}
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    {formatNotificationDate(notification.created_at)}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => onMarkAsRead(notification.id)}
                            >
                                Mark as read
                            </Button>
                        </div>
                    ))}

                    {notifications.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No unread notifications found.
                        </div>
                    ) : null}
                </div>
            </div>
        </Card>
    )
}

export default UnreadNotificationsList
