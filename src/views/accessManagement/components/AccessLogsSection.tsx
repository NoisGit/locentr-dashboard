import useSWR from 'swr'
import { apiGetAccessLogs, type AccessLog } from '@/services/AccessManagementService'
import { getItems } from '../utils'

const AccessLogsSection = () => {
    const locationId = localStorage.getItem('current_location_id') || ''
    const { data, isLoading } = useSWR(
        locationId ? ['access-management:logs', locationId] : null,
        ([, currentLocationId]) =>
            apiGetAccessLogs(currentLocationId, { page: 1, size: 10, status: 'all' }),
        { revalidateOnFocus: false },
    )

    const logs = getItems<AccessLog>(data)

    if (!locationId) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a workspace/location to view access logs.
            </p>
        )
    }

    if (isLoading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>

    if (logs.length === 0) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">No access logs found.</p>
    }

    return (
        <div className="flex flex-col gap-3">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                    <div className="font-semibold">
                        {log.full_name || log.name || log.id_number || `Access #${log.id}`}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Status: {log.status || 'unknown'} {log.plate ? `• Plate: ${log.plate}` : ''}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AccessLogsSection
