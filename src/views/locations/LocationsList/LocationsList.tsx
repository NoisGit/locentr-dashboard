import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import LocationsListTable from './components/LocationsListTable'
import LocationsListTableTools from './components/LocationsListTableTools'
import useLocationsList from './hooks/useLocationsList'

type RequestError = {
    message?: string
    response?: {
        data?: {
            message?: string
            detail?: string
        }
    }
}

function getErrorMessage(error: unknown) {
    const requestError = error as RequestError

    return (
        requestError?.response?.data?.message ||
        requestError?.response?.data?.detail ||
        requestError?.message ||
        'No se pudo cargar la lista de edificios.'
    )
}

const LocationsList = () => {
    const navigate = useNavigate()
    const { locationsList, isLoading, error, mutate } = useLocationsList()

    if (!isLoading && error) {
        const serverMsg = getErrorMessage(error)

        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3 className="text-lg font-semibold">Error al cargar edificios</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
                        <Button variant="solid" onClick={() => mutate()}>
                            Reintentar
                        </Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    if (!isLoading && locationsList.length === 0) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3 className="text-lg font-semibold">No hay edificios</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cuando se creen edificios aparecerán aquí.
                        </p>
                        <Button variant="solid" onClick={() => navigate('/buildings/create')}>
                            Crear edificio
                        </Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>Edificios</h3>
                        <Button variant="solid" onClick={() => navigate('/buildings/create')}>
                            Crear edificio
                        </Button>
                    </div>
                    <LocationsListTableTools />
                    <LocationsListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default LocationsList
