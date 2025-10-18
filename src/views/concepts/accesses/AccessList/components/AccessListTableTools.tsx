import useAccessList from '../hooks/useAccessList'
import AccessListSearch from './AccessListSearch'
import AccessListTableFilter from './AccessListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const AccessListTableTools = () => {
    const { tableData, setTableData } = useAccessList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <AccessListSearch onInputChange={handleInputChange} />
            <AccessListTableFilter />
        </div>
    )
}

export default AccessListTableTools
