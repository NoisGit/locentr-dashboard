import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import CustomerListTable from '@/views/concepts/customers/CustomerList/components/CustomerListTable'
import CustomerListActionTools from '@/views/concepts/customers/CustomerList/components/CustomerListActionTools'
import CustomersListTableTools from '@/views/concepts/customers/CustomerList/components/CustomersListTableTools'
import CustomerListSelected from '@/views/concepts/customers/CustomerList/components/CustomerListSelected'

const UsersList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Usuarios</h3>
                            <CustomerListActionTools />
                        </div>
                        <CustomersListTableTools />
                        <CustomerListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <CustomerListSelected />
        </>
    )
}

export default UsersList
