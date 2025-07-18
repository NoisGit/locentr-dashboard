import useCondosList from '../hooks/useCondosList'
import CondosListSearch from './CondosListSearch'
import CondosListTableFilter from './CondosListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const CondosListTableTools = () => {
    const { tableData, setTableData } = useCondosList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CondosListSearch onInputChange={handleInputChange} />
            <CondosListTableFilter />
        </div>
    )
}

export default CondosListTableTools
