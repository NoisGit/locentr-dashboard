import Card from '@/components/ui/Card'

type AuditLogStatsProps = {
    total: number
    visible: number
}

const AuditLogStats = ({ total, visible }: AuditLogStatsProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Audit events</div>
                <div className="mt-2 text-2xl font-semibold">{total}</div>
            </Card>
            <Card>
                <div className="text-sm text-gray-500 dark:text-gray-400">Visible now</div>
                <div className="mt-2 text-2xl font-semibold">{visible}</div>
            </Card>
        </div>
    )
}

export default AuditLogStats
