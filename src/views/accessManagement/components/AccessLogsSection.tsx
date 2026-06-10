import useSWR from 'swr'
import { apiGetAccessLogs, type AccessLog } from '@/services/AccessManagementService'
import { getItems } from '../utils'
import EmptyState from '@/components/shared/EmptyState'

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
                Selecciona una ubicación para consultar sus registros de acceso.
            </p>
        )
    }

    if (isLoading) return <p className="text-sm text-gray-500 dark:text-gray-400">Cargando registros...</p>

    if (logs.length === 0) {
        return (
            <EmptyState
                compact
                title="Sin movimientos de acceso"
                description="Las entradas y salidas registradas en esta ubicación aparecerán aquí."
            />
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                    <div className="font-semibold">
                        {log.external_people?.name || 'Persona sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.exit_date ? 'Salida registrada' : 'Dentro del edificio'}
                        {log.vehicle_plate ? ` • Patente: ${log.vehicle_plate}` : ''}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AccessLogsSection
