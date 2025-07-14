import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import PerksListTable from './components/PerksListTable'
import PerksListActionTools from './components/PerksListActionTools'
import PerksListTableTools from './components/PerksListTableTools'
import PerksListSelected from './components/PerksListSelected'

const PerksList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Perks</h3>
                            <PerksListActionTools />
                        </div>
                        <PerksListTableTools />
                        <PerksListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <PerksListSelected />
        </>
    )
}

export default PerksList
