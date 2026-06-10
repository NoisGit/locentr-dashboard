import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import LocationsListTable from './components/LocationsListTable'
import LocationsListTableTools from './components/LocationsListTableTools'
import useLocationsList from './hooks/useLocationsList'
import { useAuth } from '@/auth'
import { Permission, RBAC } from '@/utils/rbac'
import { getApiErrorMessage } from '@/utils/apiError'

const LocationsList = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const canCreate = RBAC.hasPermission(user, Permission.CREATE_LOCATION)
    const { locationsList, isLoading, error, mutate } = useLocationsList()

    if (!isLoading && error) {
        const serverMsg = getApiErrorMessage(
            error,
            'No se pudo cargar la lista de edificios.',
        )

        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3 className="text-lg font-semibold">
                            Error al cargar edificios
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {serverMsg}
                        </p>
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
                        <h3 className="text-lg font-semibold">
                            No hay edificios
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cuando se creen edificios aparecerán aquí.
                        </p>
                        {canCreate ? (
                            <Button
                                variant="solid"
                                onClick={() => navigate('/buildings/create')}
                            >
                                Crear edificio
                            </Button>
                        ) : null}
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
                        {canCreate ? (
                            <Button
                                variant="solid"
                                onClick={() => navigate('/buildings/create')}
                            >
                                Crear edificio
                            </Button>
                        ) : null}
                    </div>
                    <LocationsListTableTools />
                    <LocationsListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default LocationsList
