import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import MarketplaceListActionTools from './components/MarketplaceListActionTools'
import MarketplaceListTableTools from './components/MarketplaceListTableTools'
import MarketplaceListTable from './components/MarketplaceListTable'
import MarketplaceListSelected from './components/MarketplaceListSelected'

const MarketplaceList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Marketplace</h3>
                            <MarketplaceListActionTools />
                        </div>
                        <MarketplaceListTableTools />
                        <MarketplaceListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <MarketplaceListSelected />
        </>
    )
}

export default MarketplaceList
