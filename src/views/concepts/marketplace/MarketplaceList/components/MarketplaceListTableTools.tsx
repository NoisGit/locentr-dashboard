import MarketplaceListSearch from './MarketplaceListSearch'
import MarketplaceTableFilter from './MarketplaceTableFilter'
import useMarketplaceList from '../hooks/useMarketplaceList'
import cloneDeep from 'lodash/cloneDeep'

const MarketplaceListTableTools = () => {
    const { tableData, setTableData } = useMarketplaceList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        if (typeof val === 'string' && val.length > 1) {
            setTableData(newTableData)
        }
        if (typeof val === 'string' && val.length === 0) {
            setTableData(newTableData)
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <MarketplaceListSearch onInputChange={handleInputChange} />
            <MarketplaceTableFilter />
        </div>
    )
}

export default MarketplaceListTableTools
