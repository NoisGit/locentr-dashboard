import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import CondosListTable from './components/CondosListTable'
import CondosListActionTools from './components/CondosListActionTools'
import CondosListTableTools from './components/CondosListTableTools'
import CondosListSelected from './components/CondosListSelected'

const CondosList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Condos</h3>
                            <CondosListActionTools />
                        </div>
                        <CondosListTableTools />
                        <CondosListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <CondosListSelected />
        </>
    )
}

export default CondosList
