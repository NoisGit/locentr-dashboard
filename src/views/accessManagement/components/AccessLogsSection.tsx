import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import DataTable from '@/components/shared/DataTable'
import Input from '@/components/ui/Input'
import { apiGetAccessLogs, type AccessLog } from '@/services/AccessManagementService'
import { apiGetLocationsList } from '@/services/LocationsService'
import { getErrorMessage, getItems, getTotal } from '../utils'
import EmptyState from '@/components/shared/EmptyState'
import { useSessionUser } from '@/store/authStore'
import { isVirtualCompanyId, useCompaniesStore } from '@/store/companies/CompaniesStore'
import type { ColumnDef } from '@/components/shared/DataTable'

const AccessLogsSection = () => {
    const userCompanyId = useSessionUser((state) => state.user.company_id)
    const selectedCompanyId = useCompaniesStore((state) => state.selectedId)
    const companyId =
        selectedCompanyId !== undefined &&
        selectedCompanyId !== null &&
        !isVirtualCompanyId(selectedCompanyId)
            ? selectedCompanyId
            : (userCompanyId ?? undefined)
    const [locationId, setLocationId] = useState('')
    const [search, setSearch] = useState('')
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data: locationsData, isLoading: locationsLoading } = useSWR(
        companyId ? ['access-logs:buildings', companyId] : null,
        () => apiGetLocationsList({ pageIndex: 1, pageSize: 100, companyId }),
        { revalidateOnFocus: false },
    )
    const locations = useMemo(() => locationsData?.list ?? [], [locationsData?.list])

    useEffect(() => {
        if (locationsLoading) return

        const suggestedId = localStorage.getItem('current_location_id') || ''
        const suggestedLocation = locations.find(
            (location) => String(location.id) === suggestedId,
        )
        const nextLocationId = suggestedLocation
            ? String(suggestedLocation.id)
            : locations[0]
              ? String(locations[0].id)
              : ''

        if (nextLocationId !== locationId) {
            setLocationId(nextLocationId)
            setPageIndex(1)
        }
    }, [locationId, locations, locationsLoading])

    const { data, error, isLoading, mutate } = useSWR(
        locationId ? ['access-management:logs', locationId, search, pageIndex, pageSize] : null,
        () =>
            apiGetAccessLogs(locationId, {
                page: pageIndex,
                size: pageSize,
                status: 'all',
                search_name: search || undefined,
            }),
        { revalidateOnFocus: false },
    )

    const logs = getItems<AccessLog>(data)
    const total = getTotal(data)

    const columns: ColumnDef<AccessLog>[] = useMemo(
        () => [
            {
                header: 'Persona',
                id: 'person',
                cell: (props) => (
                    <div>
                        <div className="font-semibold">
                            {props.row.original.external_people?.name || 'Persona sin nombre'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {props.row.original.external_people?.id_number ||
                                'Documento no informado'}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Patente',
                accessorKey: 'vehicle_plate',
                cell: (props) => props.row.original.vehicle_plate || 'No informada',
            },
            {
                header: 'Ingreso',
                accessorKey: 'created_at',
                cell: (props) =>
                    props.row.original.created_at
                        ? new Intl.DateTimeFormat('es-CL', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                          }).format(new Date(props.row.original.created_at))
                        : 'Sin fecha',
            },
            {
                header: 'Estado',
                accessorKey: 'exit_date',
                cell: (props) =>
                    props.row.original.exit_date ? 'Salida registrada' : 'Dentro del edificio',
            },
        ],
        [],
    )

    if (!locationId) {
        return (
            <div className="flex flex-col gap-4">
                <label className="flex max-w-md flex-col gap-1 text-sm font-semibold">
                    Edificio
                    <select
                        className="input input-md h-11"
                        value={locationId}
                        onChange={(event) => {
                            setLocationId(event.target.value)
                            setPageIndex(1)
                        }}
                    >
                        <option value="">
                            {locationsLoading ? 'Cargando edificios...' : 'Selecciona un edificio'}
                        </option>
                        {locations.map((location) => (
                            <option key={location.id} value={String(location.id)}>
                                {location.name || 'Edificio sin nombre'}
                            </option>
                        ))}
                    </select>
                </label>
                <EmptyState
                    compact
                    title="Selecciona un edificio"
                    description="Elige una ubicación autorizada para consultar sus movimientos."
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-semibold">
                    Edificio
                    <select
                        className="input input-md h-11"
                        value={locationId}
                        onChange={(event) => {
                            setLocationId(event.target.value)
                            setPageIndex(1)
                        }}
                    >
                        <option value="">Selecciona un edificio</option>
                        {locations.map((location) => (
                            <option key={location.id} value={String(location.id)}>
                                {location.name || 'Edificio sin nombre'}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">
                    Buscar por nombre
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setPageIndex(1)
                        }}
                    />
                </label>
            </div>

            {error ? (
                <EmptyState
                    compact
                    title="No fue posible cargar los accesos"
                    description={getErrorMessage(error, 'Revisa la conexión e intenta nuevamente.')}
                    actionLabel="Reintentar"
                    onAction={() => mutate()}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={logs}
                    loading={isLoading}
                    noData={!isLoading && logs.length === 0}
                    noDataTitle="Sin movimientos de acceso"
                    noDataDescription="Las entradas y salidas registradas en este edificio aparecerán aquí."
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

export default AccessLogsSection
