import Card from '@/components/ui/Card'
import type { LocationRow } from '@/services/LocationsService'

type WorkspaceOverviewTabProps = {
    data?: LocationRow
}

const WorkspaceOverviewTab = ({ data }: WorkspaceOverviewTabProps) => {
    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Name</div>
                    <div className="font-medium">{data?.name || 'No name'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Address</div>
                    <div className="font-medium">{data?.address || 'No address'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Country</div>
                    <div className="font-medium">{data?.country || 'No country'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-medium">
                        {data?.isActive === false ? 'Inactive' : 'Active'}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default WorkspaceOverviewTab
