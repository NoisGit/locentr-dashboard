import Card from '@/components/ui/Card'
import { formatAuditLogDate, normalizeAuditLabel } from '../utils'
import type { AuditLogEntry } from '@/services/AuditLogService'

type AuditLogListProps = {
    entries: AuditLogEntry[]
}

const AuditLogList = ({ entries }: AuditLogListProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h5>Latest audit events</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Security-relevant changes recorded by Coredeck.
                    </p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="grid grid-cols-1 gap-3 py-4 lg:grid-cols-[1fr_180px] lg:items-start"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                        {normalizeAuditLabel(entry.action)}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        {normalizeAuditLabel(entry.table_name)}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {entry.description || 'No description available.'}
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    User: {entry.user_name || 'Unknown'}
                                    {entry.record_id ? ` · Record #${entry.record_id}` : ''}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 lg:text-right">
                                {formatAuditLogDate(entry.created_at)}
                            </div>
                        </div>
                    ))}

                    {entries.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            No audit events found.
                        </div>
                    ) : null}
                </div>
            </div>
        </Card>
    )
}

export default AuditLogList
