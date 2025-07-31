import Container from '@/components/shared/Container'
import ManageHelpHeader from './components/ManageHelpHeader'
import HelpListTable from './components/HelpListTable'
import HelpListSelected from './components/HelpListSelected'

const ManageHelp = () => {
    return (
        <>
            <Container>
                <ManageHelpHeader />
                <HelpListTable />
            </Container>
            <HelpListSelected />
            <div className="h-6" />
        </>
    )
}

export default ManageHelp
