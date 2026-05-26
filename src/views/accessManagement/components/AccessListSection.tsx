import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import AccessRuleCard from './AccessRuleCard'
import AccessRuleForm from './AccessRuleForm'
import {
    apiCreateBlacklist,
    apiCreateWhitelist,
    apiGetBlacklist,
    apiGetWhitelist,
    apiRemoveBlacklist,
    apiRevokeWhitelist,
    type AccessListEntry,
} from '@/services/AccessManagementService'
import { buildScopeParams, getErrorMessage, getItems } from '../utils'
import type { ListType, ScopeType } from '../types'

const AccessListSection = ({ type }: { type: ListType }) => {
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
            <AccessRuleForm
                companyId={companyId}
                fullName={fullName}
                idNumber={idNumber}
                isSubmitting={isSubmitting}
                locationId={locationId}
                reason={reason}
                scope={scope}
                setCompanyId={setCompanyId}
                setFullName={setFullName}
                setIdNumber={setIdNumber}
                setLocationId={setLocationId}
                setReason={setReason}
                setScope={setScope}
                setVehiclePlate={setVehiclePlate}
                type={type}
                vehiclePlate={vehiclePlate}
                onSubmit={handleSubmit}
            />

            {isLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p> : null}

            {!isLoading && entries.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No records found.</p>
            ) : null}

            <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                    <AccessRuleCard
                        key={`${entry.id_number || entry.id || entry.full_name}`}
                        entry={entry}
                        type={type}
                        onRemove={handleRemove}
                    />
                ))}
            </div>
        </div>
    )
}

export default AccessListSection
