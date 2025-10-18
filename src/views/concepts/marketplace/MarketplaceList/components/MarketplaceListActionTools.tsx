import Button from '@/components/ui/Button'
import { TbCloudDownload, TbPlus } from 'react-icons/tb'
import { useNavigate } from 'react-router'
import useMarketplaceList from '../hooks/useMarketplaceList' // OJO: hook marketplace
import { CSVLink } from 'react-csv'

const MarketplaceListActionTools = () => {
    const navigate = useNavigate()

    const { marketplaceList } = useMarketplaceList() // OJO: variable para el marketplace

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink filename="marketplace-list.csv" data={marketplaceList}>
                <Button icon={<TbCloudDownload className="text-xl" />}>
                    Export
                </Button>
            </CSVLink>
            <Button
                variant="solid"
                icon={<TbPlus className="text-xl" />}
                onClick={() => navigate('/concepts/marketplace/marketplace-create')}
            >
                Add item
            </Button>
        </div>
    )
}

export default MarketplaceListActionTools
