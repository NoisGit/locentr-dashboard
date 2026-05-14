import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import UsersListTable from './components/UsersListTable'
import UsersListActionTools from './components/UsersListActionTools'
import UsersListTableTools from './components/UsersListTableTools'
import UsersListSelected from './components/UsersListSelected'

const UsersList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Usuarios</h3>
                            <UsersListActionTools />
                        </div>
                        <UsersListTableTools />
                        <UsersListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <UsersListSelected />
        </>
    )
}

export default UsersList
