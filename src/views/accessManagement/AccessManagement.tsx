import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import UsersList from '@/views/users/UsersList/UsersList'
import {
    apiCreateBlacklist,
    apiCreateWhitelist,
    apiGetAccessLogs,
    apiGetBlacklist,
    apiGetWhitelist,
    apiRemoveBlacklist,
    apiRevokeWhitelist,
    type AccessListEntry,
    type AccessLog,
    type AccessScopeParams,
} from '@/services/AccessManagementService'

type TabKey = 'users' | 'whitelist' | 'blacklist' | 'logs'
type ListType = 'whitelist' | 'blacklist'
type ScopeType = 'location' | 'company' | 'portfolio'

const tabs: { key: TabKey; label: string }[] = [
    { key: 'users', label: 'Users' },
    { key: 'whitelist', label: 'Whitelist' },
    { key: 'blacklist', label: 'Blacklist' },
    { key: 'logs', label: 'Access logs' },
]

const scopeOptions: { value: ScopeType; label: string }[] = [
    { value: 'location', label: 'Location' },
    { value: 'company', label: 'Company' },
    { value: 'portfolio', label: 'Admin portfolio' },
]

function getItems<T>(data: { items?: T[]; list?: T[] } | undefined): T[] {
    return data?.items || data?.list || []
}

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

function buildScopeParams(scope: ScopeType, locationId: string, companyId: string) {
    const params: AccessScopeParams = {}

    if (scope === 'location' && locationId.trim()) {
        params.location_id = locationId.trim()
    }

    if (scope === 'company' && companyId.trim()) {
        params.company_id = companyId.trim()
    }

    return params
}

function ScopeControls({
    scope,
    setScope,
    locationId,
    setLocationId,
    companyId,
    setCompanyId,
}: {
    scope: ScopeType
    setScope: (scope: ScopeType) => void
    locationId: string
    setLocationId: (value: string) => void
    companyId: string
    setCompanyId: (value: string) => void
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Scope</label>
                <select
                    className="input input-md h-11"
                    value={scope}
                    onChange={(event) => setScope(event.target.value as ScopeType)}
                >
                    {scopeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Location ID</label>
                <Input
                    disabled={scope !== 'location'}
                    placeholder="Location ID"
                    value={locationId}
                    onChange={(event) => setLocationId(event.target.value)}
                />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Company ID</label>
                <Input
                    disabled={scope !== 'company'}
                    placeholder="Company ID"
                    value={companyId}
                    onChange={(event) => setCompanyId(event.target.value)}
                />
            </div>
        </div>
    )
}

function AccessListSection({ type }: { type: ListType }) {
    const [scope, setScope] = useState<ScopeType>('location')
    const [locationId, setLocationId] = useState(localStorage.getItem('current_location_id') || '')
    const [companyId, setCompanyId] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [fullName, setFullName] = useState('')
    const [reason, setReason] = useState('')
    const [vehiclePlate, setVehiclePlate] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const scopeParams = useMemo(
        () => buildScopeParams(scope, locationId, companyId),
        [companyId, locationId, scope],
    )

    const { data, isLoading, mutate } = useSWR(
        [`access-management:${type}`, scope, locationId, companyId],
        () =>
            type === 'whitelist'
                ? apiGetWhitelist({ page: 1, size: 10, ...scopeParams })
                : apiGetBlacklist({ page: 1, size: 10, ...scopeParams }),
        { revalidateOnFocus: false },
    )

    const entries = getItems<AccessListEntry>(data)

    const handleSubmit = async () => {
        if (!idNumber.trim() || !fullName.trim()) return
        if (scope === 'portfolio') {
            toast.push(
                <Notification type="warning">
                    Admin portfolio scope requires backend confirmation before use.
                </Notification>,
                { placement: 'top-center' },
            )
            return
        }

        try {
            setIsSubmitting(true)
            if (type === 'whitelist') {
                await apiCreateWhitelist(
                    {
                        id_number: idNumber.trim(),
                        full_name: fullName.trim(),
                        reason: reason.trim() || undefined,
                        vehicle_plate: vehiclePlate.trim() || undefined,
                    },
                    scopeParams,
                )
            } else {
                await apiCreateBlacklist(
                    {
                        id_number: idNumber.trim(),
                        full_name: fullName.trim(),
                        reason: reason.trim() || 'Access restriction',
                    },
                    scopeParams,
                )
            }

            setIdNumber('')
            setFullName('')
            setReason('')
            setVehiclePlate('')
            await mutate()
            toast.push(<Notification type="success">Access rule saved.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Access rule could not be saved.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemove = async (entry: AccessListEntry) => {
        if (!entry.id_number) return

        try {
            if (type === 'whitelist') {
                await apiRevokeWhitelist(entry.id_number, scopeParams)
            } else {
                await apiRemoveBlacklist(entry.id_number, scopeParams)
            }
            await mutate()
            toast.push(<Notification type="success">Access rule removed.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'Access rule could not be removed.')}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <div className="flex flex-col gap-4">
                    <ScopeControls
                        companyId={companyId}
                        locationId={locationId}
                        scope={scope}
                        setCompanyId={setCompanyId}
                        setLocationId={setLocationId}
                        setScope={setScope}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Input
                            placeholder="ID number"
                            value={idNumber}
                            onChange={(event) => setIdNumber(event.target.value)}
                        />
                        <Input
                            placeholder="Full name"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                        />
                        <Input
                            placeholder="Reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                        />
                        <Input
                            disabled={type === 'blacklist'}
                            placeholder="Vehicle plate"
                            value={vehiclePlate}
                            onChange={(event) => setVehiclePlate(event.target.value)}
                        />
                    </div>
                    <div>
                        <Button
                            variant="solid"
                            loading={isSubmitting}
                            onClick={handleSubmit}
                        >
                            {type === 'whitelist' ? 'Allow person' : 'Restrict person'}
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p> : null}

            {!isLoading && entries.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No records found.</p>
            ) : null}

            <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                    <div
                        key={`${entry.id_number || entry.id || entry.full_name}`}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                        <div>
                            <div className="font-semibold">
                                {entry.full_name || entry.name || entry.id_number || 'Unnamed record'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {entry.id_number || 'N/A'} {entry.vehicle_plate ? `• Plate: ${entry.vehicle_plate}` : ''}
                            </div>
                            <div className="text-xs text-gray-400">
                                {entry.location_id ? `Location ${entry.location_id}` : entry.company_id ? `Company ${entry.company_id}` : 'Scope not specified'}
                            </div>
                        </div>
                        <Button size="sm" onClick={() => handleRemove(entry)}>
                            {type === 'whitelist' ? 'Revoke access' : 'Remove restriction'}
                        </Button>
                    </div>
                ))}
            </div>
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
