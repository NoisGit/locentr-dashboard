import LogbookListSearch from './LogbookListSearch'
import LogbookTableFilter from './LogbookTableFilter'
import useLogbookList from '../hooks/useLogbookList'
import cloneDeep from 'lodash/cloneDeep'

const LogbookListTableTools = () => {
    const { tableData, setTableData } = useLogbookList()

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
            <LogbookListSearch onInputChange={handleInputChange} />
            <LogbookTableFilter />
        </div>
    )
}

export default LogbookListTableTools
