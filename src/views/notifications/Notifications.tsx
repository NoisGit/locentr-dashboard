import { useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { ADMIN, SUPERADMIN } from '@/constants/roles.constant'
import { useSessionUser } from '@/store/authStore'
import {
    apiMarkNotificationAsRead,
    apiSendNotificationToAllUsers,
} from '@/services/NotificationsService'
import NotificationsBroadcastForm from './components/NotificationsBroadcastForm'
import NotificationsStats from './components/NotificationsStats'
import UnreadNotificationsList from './components/UnreadNotificationsList'
import { useUnreadNotifications } from './hooks/useUnreadNotifications'

function getErrorMessage(error: unknown, fallback: string) {
    const requestError = error as {
        response?: { data?: { message?: string; detail?: string } }
        message?: string
    }

    return (
        requestError?.response?.data?.message ||
        requestError?.response?.data?.detail ||
        requestError?.message ||
        fallback
    )
}

const Notifications = () => {
    const role = useSessionUser((state) => state.user.role)
    const authority = useSessionUser((state) => state.user.authority ?? [])
    const canSendBroadcast =
        role === SUPERADMIN ||
        role === ADMIN ||
        authority.includes(SUPERADMIN) ||
        authority.includes(ADMIN)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data, isLoading, mutate } = useUnreadNotifications()
    const notifications = data?.items ?? []

    const handleSendBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.push(
                <Notification type="warning">
                    Title and message are required.
                </Notification>,
                { placement: 'top-center' },
            )
            return
        }

        try {
            setIsSubmitting(true)
            const response = await apiSendNotificationToAllUsers({
                message: message.trim(),
                title: title.trim(),
            })
            setMessage('')
            setTitle('')
            toast.push(
                <Notification type="success">
                    Notification sent. Success: {response.success}. Failed: {response.failed}.
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Notification could not be sent.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await apiMarkNotificationAsRead(notificationId)
            await mutate()
            toast.push(<Notification type="success">Notification marked as read.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Notification could not be marked as read.')}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <Container>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3>Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review unread notifications and send platform updates.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Refresh</Button>
                </div>

                <NotificationsStats
                    total={data?.total ?? notifications.length}
                    visible={notifications.length}
                />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <AdaptiveCard>
                            <Loading loading={isLoading}>
                                <UnreadNotificationsList
                                    notifications={notifications}
                                    onMarkAsRead={handleMarkAsRead}
                                />
                            </Loading>
                        </AdaptiveCard>
                    </div>
                    <NotificationsBroadcastForm
                        canSend={canSendBroadcast}
                        isSubmitting={isSubmitting}
                        message={message}
                        setMessage={setMessage}
                        setTitle={setTitle}
                        title={title}
                        onSubmit={handleSendBroadcast}
                    />
                </div>
            </div>
        </Container>
    )
}

export default Notifications
