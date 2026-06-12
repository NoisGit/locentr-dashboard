import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import DataTable from '@/components/shared/DataTable'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import EmptyState from '@/components/shared/EmptyState'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Upload from '@/components/ui/Upload'
import AccessRuleForm from './AccessRuleForm'
import {
    apiBulkImportBlacklist,
    apiBulkImportWhitelist,
    apiCreateBlacklist,
    apiCreateWhitelist,
    apiGetBlacklist,
    apiGetWhitelist,
    apiRemoveBlacklist,
    apiRevokeWhitelist,
    type AccessListEntry,
} from '@/services/AccessManagementService'
import { buildScopeParams, getErrorMessage, getItems, getTotal, isScopeReady } from '../utils'
import type { ListType, ScopeType } from '../types'
import { normalizeUserInput } from '@/utils/security/input'
import { validateCsvUpload } from '@/utils/security/files'
import { isVirtualCompanyId, useCompaniesStore } from '@/store/companies/CompaniesStore'
import { useSessionUser } from '@/store/authStore'
import type { ColumnDef } from '@/components/shared/DataTable'

type AccessListSectionProps = {
    type: ListType
    canCreate: boolean
    canRemove: boolean
}

const AccessListSection = ({ type, canCreate, canRemove }: AccessListSectionProps) => {
    const userCompanyId = useSessionUser((state) => state.user.company_id)
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const activeCompanyId =
        selectedCompanyId !== undefined &&
        selectedCompanyId !== null &&
        !isVirtualCompanyId(selectedCompanyId)
            ? String(selectedCompanyId)
            : String(userCompanyId || '')
    const [scope, setScope] = useState<ScopeType>('location')
    const [locationId, setLocationId] = useState('')
    const [companyId, setCompanyId] = useState(activeCompanyId)
    const [search, setSearch] = useState('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [idNumber, setIdNumber] = useState('')
    const [fullName, setFullName] = useState('')
    const [reason, setReason] = useState('')
    const [vehiclePlate, setVehiclePlate] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)

    useEffect(() => {
        setCompanyId(activeCompanyId)
        setLocationId('')
        setPageIndex(1)
    }, [activeCompanyId])

    const scopeParams = useMemo(
        () => buildScopeParams(scope, locationId, companyId),
        [companyId, locationId, scope],
    )

    const scopeReady = isScopeReady(scope, locationId, companyId)
    const { data, error, isLoading, mutate } = useSWR(
        scopeReady
            ? [
                  `access-management:${type}`,
                  scope,
                  locationId,
                  companyId,
                  search,
                  pageIndex,
                  pageSize,
              ]
            : null,
        () =>
            type === 'whitelist'
                ? apiGetWhitelist({
                      page: pageIndex,
                      size: pageSize,
                      search: search || undefined,
                      ...scopeParams,
                  })
                : apiGetBlacklist({
                      page: pageIndex,
                      size: pageSize,
                      search: search || undefined,
                      ...scopeParams,
                  }),
        { revalidateOnFocus: false },
    )

    const entries = getItems<AccessListEntry>(data)
    const total = getTotal(data)

    const handleScopeChange = (nextScope: ScopeType) => {
        setScope(nextScope)
        setPageIndex(1)
    }

    const handleLocationChange = (value: string) => {
        setLocationId(value)
        setPageIndex(1)
    }

    const handleCompanyChange = (value: string) => {
        setCompanyId(value)
        setPageIndex(1)
    }

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPageIndex(1)
    }

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

    const handleBulkImport = async (file: File) => {
        if (scope !== 'location' || !locationId) {
            toast.push(
                <Notification type="warning">
                    Selecciona un edificio antes de importar el CSV.
                </Notification>,
                { placement: 'top-center' },
            )
            return
        }

        try {
            setIsImporting(true)
            if (type === 'whitelist') {
                await apiBulkImportWhitelist(locationId, file)
            } else {
                await apiBulkImportBlacklist(locationId, file)
            }
            await mutate()
            toast.push(
                <Notification type="success">Archivo CSV importado correctamente.</Notification>,
                { placement: 'top-center' },
            )
        } catch (importError) {
            toast.push(
                <Notification type="danger">
                    {getErrorMessage(importError, 'No fue posible importar el archivo CSV.')}
                </Notification>,
                { placement: 'top-center' },
            )
        } finally {
            setIsImporting(false)
        }
    }

    const handleRemove = useCallback(
        async (entry: AccessListEntry) => {
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
        },
        [mutate, scopeParams, type],
    )

    const columns: ColumnDef<AccessListEntry>[] = useMemo(
        () => [
            {
                header: 'Persona',
                accessorKey: 'full_name',
                cell: (props) => (
                    <div>
                        <div className="font-semibold">
                            {props.row.original.full_name || 'Persona sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {props.row.original.id_number || 'Documento no informado'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Motivo',
                accessorKey: 'reason',
                cell: (props) => props.row.original.reason || 'Sin motivo informado',
            },
            {
                header: 'Patente',
                accessorKey: 'vehicle_plate',
                cell: (props) => props.row.original.vehicle_plate || 'No aplica',
            },
            {
                header: '',
                id: 'actions',
                cell: (props) =>
                    canRemove ? (
                        <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleRemove(props.row.original)}>
                                {type === 'whitelist' ? 'Revocar' : 'Eliminar'}
                            </Button>
                        </div>
                    ) : null,
            },
        ],
        [canRemove, handleRemove, type],
    )

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
                    setCompanyId={handleCompanyChange}
                    setFullName={setFullName}
                    setIdNumber={setIdNumber}
                    setLocationId={handleLocationChange}
                    setReason={setReason}
                    setScope={handleScopeChange}
                    setVehiclePlate={setVehiclePlate}
                    type={type}
                    vehiclePlate={vehiclePlate}
                    onSubmit={handleSubmit}
                />
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Input
                    className="w-full md:max-w-sm"
                    placeholder="Buscar por nombre o documento"
                    value={search}
                    onChange={(event) => handleSearchChange(event.target.value)}
                />
                {canCreate && scope === 'location' ? (
                    <Upload
                        accept=".csv,text/csv"
                        beforeUpload={(files) => validateCsvUpload(files?.[0] ?? null) || true}
                        disabled={!locationId || isImporting}
                        showList={false}
                        uploadLimit={1}
                        onChange={(files) => {
                            const file = files[0]
                            if (file) void handleBulkImport(file)
                        }}
                    >
                        <Button type="button" loading={isImporting} disabled={!locationId}>
                            Importar CSV
                        </Button>
                    </Upload>
                ) : null}
            </div>

            {!scopeReady ? (
                <EmptyState
                    compact
                    title="Selecciona un alcance"
                    description="Elige un edificio o una empresa para consultar sus registros."
                />
            ) : error ? (
                <EmptyState
                    compact
                    title="No fue posible cargar la lista"
                    description={getErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                    actionLabel="Reintentar"
                    onAction={() => mutate()}
                    />
            ) : (
                <DataTable
                    columns={columns}
                    data={entries}
                    loading={isLoading}
                    noData={!isLoading && entries.length === 0}
                    noDataTitle="No hay registros en esta lista"
                    noDataDescription="Los permisos o restricciones que agregues aparecerán aquí."
                    pagingData={{ total, pageIndex, pageSize }}
                    onPaginationChange={setPageIndex}
                    onSelectChange={(value) => {
                        setPageSize(Number(value))
                        setPageIndex(1)
                    }}
                />
            )}
        </div>
    )
}

export default AccessListSection
