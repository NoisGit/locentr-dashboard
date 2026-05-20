import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import UsersListTable from './components/UsersListTable'
import UsersListTableTools from './components/UsersListTableTools'
import useUsersList from './hooks/useUsersList'

const UsersList = () => {
    const navigate = useNavigate()
    const { usersList, isLoading, error, mutate } = useUsersList()

    if (!isLoading && error) {
        const serverMsg =
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.detail ||
            (error as any)?.message ||
            'No se pudo cargar la lista de usuarios.'

        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3 className="text-lg font-semibold">Error al cargar usuarios</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">{serverMsg}</p>
                        <Button onClick={() => mutate()} variant="solid">Reintentar</Button>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    if (!isLoading && usersList.length === 0) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <h3 className="text-lg font-semibold">No hay usuarios</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cuando se creen usuarios aparecerán aquí.
                        </p>
                        <Button variant="solid" onClick={() => navigate('/users/create')}>
                            Crear usuario
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
                        <h3>Usuarios</h3>
                        <Button variant="solid" onClick={() => navigate('/users/create')}>
                            Crear usuario
                        </Button>
                    </div>
                    <UsersListTableTools />
                    <UsersListTable />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default UsersList
