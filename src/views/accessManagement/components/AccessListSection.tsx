import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import EmptyState from '@/components/shared/EmptyState'
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
import { normalizeUserInput } from '@/utils/security/input'

type AccessListSectionProps = {
    type: ListType
    canCreate: boolean
    canRemove: boolean
}

const AccessListSection = ({
    type,
    canCreate,
    canRemove,
}: AccessListSectionProps) => {
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
        const safeIdNumber = normalizeUserInput(idNumber, 80)
        const safeFullName = normalizeUserInput(fullName, 160)
        const safeReason = normalizeUserInput(reason, 300)
        const safeVehiclePlate = normalizeUserInput(vehiclePlate, 20).toUpperCase()

        if (!safeIdNumber || !safeFullName) return
        try {
            setIsSubmitting(true)
            if (type === 'whitelist') {
                await apiCreateWhitelist(
                    {
                        id_number: safeIdNumber,
                        full_name: safeFullName,
                        reason: safeReason || undefined,
                        vehicle_plate: safeVehiclePlate || undefined,
                    },
                    scopeParams,
                )
            } else {
                await apiCreateBlacklist(
                    {
                        id_number: safeIdNumber,
                        full_name: safeFullName,
                        reason: safeReason || 'Restricción de acceso',
                    },
                    scopeParams,
                )
            }

            setIdNumber('')
            setFullName('')
            setReason('')
            setVehiclePlate('')
            await mutate()
            toast.push(<Notification type="success">Regla de acceso guardada.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'No fue posible guardar la regla de acceso.')}
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
            toast.push(<Notification type="success">Regla de acceso eliminada.</Notification>, {
                placement: 'top-center',
            })
        } catch (error) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(error, 'No fue posible eliminar la regla de acceso.')}
                </Notification>,
                { placement: 'top-center' },
            )
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {canCreate ? (
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
            ) : null}

            {isLoading ? <p className="text-sm text-gray-500 dark:text-gray-400">Cargando registros...</p> : null}

            {!isLoading && entries.length === 0 ? (
                <EmptyState
                    compact
                    title="No hay registros en esta lista"
                    description="Los permisos o restricciones que agregues aparecerán aquí."
                />
            ) : null}

            <div className="flex flex-col gap-3">
                {entries.map((entry) => (
                    <AccessRuleCard
                        key={`${entry.id_number || entry.id || entry.full_name}`}
                        entry={entry}
                        type={type}
                        onRemove={canRemove ? handleRemove : undefined}
                    />
                ))}
            </div>
        </div>
    )
}

export default AccessListSection
