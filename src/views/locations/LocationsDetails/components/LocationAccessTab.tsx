import Card from '@/components/ui/Card'
import type { LocationAccessEntry } from '@/services/LocationsService'

type LocationAccessTabProps = {
    accessEntries?: LocationAccessEntry[]
}

const LocationAccessTab = ({ accessEntries }: LocationAccessTabProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-3">
                <div>
                    <h5>Accesos</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Registros efectivos de listas permitidas y bloqueadas para esta ubicación.
                    </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {accessEntries?.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="py-3 flex justify-between gap-3">
                            <div>
                                <div className="font-medium">{entry.full_name}</div>
                                <div className="text-sm text-gray-500">{entry.id_number}</div>
                            </div>
                            <div className="text-sm font-semibold">{entry.type_access_list}</div>
                        </div>
                    )) || <div className="text-sm text-gray-500">No hay accesos.</div>}
                </div>
            </div>
        </Card>
    )
}

export default LocationAccessTab
