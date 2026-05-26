import Button from '@/components/ui/Button'
import type { AccessListEntry } from '@/services/AccessManagementService'
import type { ListType } from '../types'

type AccessRuleCardProps = {
    entry: AccessListEntry
    type: ListType
    onRemove: (entry: AccessListEntry) => void
}

const AccessRuleCard = ({ entry, type, onRemove }: AccessRuleCardProps) => {
    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
                <div className="font-semibold">
                    {entry.full_name || entry.name || entry.id_number || 'Unnamed record'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {entry.id_number || 'N/A'} {entry.vehicle_plate ? `• Plate: ${entry.vehicle_plate}` : ''}
                </div>
                <div className="text-xs text-gray-400">
                    {entry.location_id
                        ? `Location ${entry.location_id}`
                        : entry.company_id
                          ? `Company ${entry.company_id}`
                          : 'Scope not specified'}
                </div>
            </div>
            <Button size="sm" onClick={() => onRemove(entry)}>
                {type === 'whitelist' ? 'Revoke access' : 'Remove restriction'}
            </Button>
        </div>
    )
}

export default AccessRuleCard
