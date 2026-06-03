import Card from '@/components/ui/Card'
import type { LocationOperator, PaginatedResponse } from '@/services/LocationsService'

type LocationOperatorsTabProps = {
    operators?: PaginatedResponse<LocationOperator>
}

const LocationOperatorsTab = ({ operators }: LocationOperatorsTabProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h5>Operadores asignados</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Usuarios que pueden operar en esta ubicación.
                        </p>
                    </div>
                    <div className="text-sm font-semibold">
                        {operators?.items?.length ?? 0} visibles
                    </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {operators?.items?.slice(0, 5).map((operator) => (
                        <div key={operator.id} className="py-3 flex justify-between gap-3">
                            <div>
                                <div className="font-medium">{operator.full_name}</div>
                                <div className="text-sm text-gray-500">{operator.email}</div>
                            </div>
                            <div className="text-sm">
                                {operator.status ? 'Activo' : 'Inactivo'}
                            </div>
                        </div>
                    )) || <div className="text-sm text-gray-500">No hay operadores.</div>}
                </div>
            </div>
        </Card>
    )
}

export default LocationOperatorsTab
