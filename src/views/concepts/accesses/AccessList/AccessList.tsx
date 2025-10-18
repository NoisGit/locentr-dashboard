import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import AccessListTable from './components/AccessListTable'
import AccessListActionTools from './components/AccessListActionTools'
import AccessListTableTools from './components/AccessListTableTools'
import AccessListSelected from './components/AccessListSelected'

const AccessList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Accesos</h3>
                            <AccessListActionTools />
                        </div>
                        <AccessListTableTools />
                        <AccessListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <AccessListSelected />
        </>
    )
}

export default AccessList
