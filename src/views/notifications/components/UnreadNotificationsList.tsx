import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import DataTable from '@/components/shared/DataTable'
import { formatNotificationDate } from '../utils'
import type { ColumnDef } from '@/components/shared/DataTable'
import type { NotificationMessage } from '@/services/NotificationsService'

type UnreadNotificationsListProps = {
    notifications: NotificationMessage[]
    isLoading: boolean
    total: number
    pageIndex: number
    pageSize: number
    onMarkAsRead: (notificationId: number) => void
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
}

const UnreadNotificationsList = ({
    notifications,
    isLoading,
    total,
    pageIndex,
    pageSize,
    onMarkAsRead,
    onPaginationChange,
    onSelectChange,
}: UnreadNotificationsListProps) => {
    const columns: ColumnDef<NotificationMessage>[] = useMemo(
        () => [
            {
                header: 'Título',
                accessorKey: 'title',
                cell: (props) => (
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {props.row.original.title || 'Sin título'}
                    </div>
                ),
            },
            {
                header: 'Mensaje',
                accessorKey: 'message',
                cell: (props) => (
                    <span className="line-clamp-2">
                        {props.row.original.message || 'Sin mensaje'}
                    </span>
                ),
            },
            {
                header: 'Fecha',
                accessorKey: 'created_at',
                cell: (props) => formatNotificationDate(props.row.original.created_at),
            },
            {
                header: '',
                id: 'action',
                cell: (props) => (
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={() => onMarkAsRead(props.row.original.id)}
                        >
                            Marcar leída
                        </Button>
                    </div>
                ),
            },
        ],
        [onMarkAsRead],
    )

    return (
        <DataTable
            columns={columns}
            data={notifications}
            noData={!isLoading && notifications.length === 0}
            loading={isLoading}
            pagingData={{ total, pageIndex, pageSize }}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default UnreadNotificationsList
