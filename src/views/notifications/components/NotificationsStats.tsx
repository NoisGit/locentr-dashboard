import Card from '@/components/ui/Card'

type NotificationsStatsProps = {
    total: number
    visible: number
}

const NotificationsStats = ({ total, visible }: NotificationsStatsProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Unread notifications</div>
                <div className="mt-2 text-2xl font-semibold">{total}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Visible now</div>
                <div className="mt-2 text-2xl font-semibold">{visible}</div>
            </Card>
        </div>
    )
}

export default NotificationsStats
