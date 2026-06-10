import Button from '@/components/ui/Button'
import type { AccessListEntry } from '@/services/AccessManagementService'
import type { ListType } from '../types'

type AccessRuleCardProps = {
    entry: AccessListEntry
    type: ListType
    onRemove?: (entry: AccessListEntry) => void
}

const AccessRuleCard = ({ entry, type, onRemove }: AccessRuleCardProps) => {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <div className="font-semibold">
                    {entry.full_name || entry.id_number || 'Registro sin nombre'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Documento: {entry.id_number || 'No informado'} {entry.vehicle_plate ? `• Patente: ${entry.vehicle_plate}` : ''}
                </div>
                <div className="text-xs text-gray-400">
                    {entry.location_id
                        ? 'Alcance: edificio'
                        : entry.company_id
                          ? 'Alcance: empresa'
                          : 'Alcance no especificado'}
                </div>
            </div>
            {onRemove ? (
                <Button size="sm" onClick={() => onRemove(entry)}>
                    {type === 'whitelist'
                        ? 'Revocar acceso'
                        : 'Eliminar restricción'}
                </Button>
            ) : null}
        </div>
    )
}

export default AccessRuleCard
