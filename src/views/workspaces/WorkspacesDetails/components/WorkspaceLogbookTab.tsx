import Card from '@/components/ui/Card'
import type {
    LocationLogbookEntry,
    LocationLogbookSettings,
    PaginatedResponse,
} from '@/services/LocationLogbookService'

type WorkspaceLogbookTabProps = {
    settings?: LocationLogbookSettings
    entries?: PaginatedResponse<LocationLogbookEntry>
}

const WorkspaceLogbookTab = ({ settings, entries }: WorkspaceLogbookTabProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h5>Location logbook</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Operational records and visual evidence for this location.
                        </p>
                    </div>
                    <div className="text-sm font-semibold">
                        {settings?.is_enabled ? 'Enabled' : 'Disabled'}
                    </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {entries?.items?.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="py-3">
                            <div className="font-medium">{entry.user_full_name || 'Unknown user'}</div>
                            <div className="text-sm text-gray-500">{entry.description}</div>
                        </div>
                    )) || <div className="text-sm text-gray-500">No logbook entries found.</div>}
                </div>
            </div>
        </Card>
    )
}

export default WorkspaceLogbookTab
