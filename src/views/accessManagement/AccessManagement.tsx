import { useState } from 'react'
import useSWR from 'swr'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import UsersList from '@/views/users/UsersList/UsersList'
import {
    apiGetWhitelist,
    apiGetBlacklist,
    apiGetAccessLogs,
    type AccessListEntry,
    type AccessLog,
} from '@/services/AccessManagementService'

type TabKey = 'users' | 'whitelist' | 'blacklist' | 'logs'

const tabs: { key: TabKey; label: string }[] = [
    { key: 'users', label: 'Users' },
    { key: 'whitelist', label: 'Whitelist' },
    { key: 'blacklist', label: 'Blacklist' },
    { key: 'logs', label: 'Access logs' },
]

function getItems<T>(data: { items?: T[]; list?: T[] } | undefined): T[] {
    return data?.items || data?.list || []
}

function AccessListSection({ type }: { type: 'whitelist' | 'blacklist' }) {
    const { data, isLoading } = useSWR(
        [`access-management:${type}`],
        () => type === 'whitelist' ? apiGetWhitelist({ page: 1, size: 10 }) : apiGetBlacklist({ page: 1, size: 10 }),
        { revalidateOnFocus: false },
    )

    const entries = getItems<AccessListEntry>(data)

    if (isLoading) return <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>

    if (entries.length === 0) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">No records found.</p>
    }

    return (
        <div className="flex flex-col gap-3">
            {entries.map((entry) => (
                <div
                    key={`${entry.id_number || entry.id || entry.full_name}`}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                    <div className="font-semibold">
                        {entry.full_name || entry.name || entry.id_number || 'Unnamed record'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {entry.id_number || 'N/A'} {entry.plate ? `• Plate: ${entry.plate}` : ''}
                    </div>
                </div>
            ))}
        </div>
    )
}

function AccessLogsSection() {
    const locationId = localStorage.getItem('current_location_id') || ''
    const { data, isLoading } = useSWR(
        locationId ? ['access-management:logs', locationId] : null,
        ([, currentLocationId]) => apiGetAccessLogs(currentLocationId, { page: 1, size: 10, status: 'all' }),
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

const AccessManagement = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('users')

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div>
                        <h3>Access Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage users, access lists and access logs from one place.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.key}
                                variant={activeTab === tab.key ? 'solid' : 'default'}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {activeTab === 'users' ? <UsersList /> : null}
                    {activeTab === 'whitelist' ? <AccessListSection type="whitelist" /> : null}
                    {activeTab === 'blacklist' ? <AccessListSection type="blacklist" /> : null}
                    {activeTab === 'logs' ? <AccessLogsSection /> : null}
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default AccessManagement
