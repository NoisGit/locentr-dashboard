import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'
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
    const canSendBroadcast = role === Role.SUPERADMIN || role === Role.ADMIN
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { data, isLoading, mutate } = useUnreadNotifications({ pageIndex, pageSize })
    const notifications = useMemo(() => data?.items ?? [], [data?.items])
    const total = data?.total ?? 0

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handlePageSizeChange = (value: number) => {
        setPageSize(Number(value))
        setPageIndex(1)
    }

    const handleSendBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.push(
                <Notification type="warning">
                    El título y el mensaje son obligatorios.
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
                    Notificación enviada. Correctas: {response.success}. Fallidas: {response.failed}.
                </Notification>,
                { placement: 'top-center' },
            )
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'No se pudo enviar la notificación.')}
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
            toast.push(<Notification type="success">Notificación marcada como leída.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'No se pudo marcar la notificación como leída.')}
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
                        <h3>Notificaciones</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Revisa notificaciones pendientes y envía comunicados de plataforma.
                        </p>
                    </div>
                    <Button onClick={() => mutate()}>Actualizar</Button>
                </div>

                <NotificationsStats total={total} visible={notifications.length} />

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <AdaptiveCard>
                            <UnreadNotificationsList
                                notifications={notifications}
                                isLoading={isLoading}
                                total={total}
                                pageIndex={pageIndex}
                                pageSize={pageSize}
                                onMarkAsRead={handleMarkAsRead}
                                onPaginationChange={handlePaginationChange}
                                onSelectChange={handlePageSizeChange}
                            />
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
