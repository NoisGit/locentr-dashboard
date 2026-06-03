import Card from '@/components/ui/Card'
import type { LocationRow } from '@/services/LocationsService'

type LocationOverviewTabProps = {
    data?: LocationRow
}

const LocationOverviewTab = ({ data }: LocationOverviewTabProps) => {
    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Nombre</div>
                    <div className="font-medium">{data?.name || 'Sin nombre'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Dirección</div>
                    <div className="font-medium">{data?.address || 'Sin dirección'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">País</div>
                    <div className="font-medium">{data?.country || 'Sin país'}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Estado</div>
                    <div className="font-medium">
                        {data?.isActive === false ? 'Inactiva' : 'Activa'}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default LocationOverviewTab
