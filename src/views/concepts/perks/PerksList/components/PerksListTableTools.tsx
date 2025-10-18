import usePerksList from '../hooks/usePerksList'
import PerksListSearch from './PerksListSearch'
import PerksListTableFilter from './PerksListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const PerksListTableTools = () => {
    const { tableData, setTableData } = usePerksList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <PerksListSearch onInputChange={handleInputChange} />
            <PerksListTableFilter />
        </div>
    )
}

export default PerksListTableTools
