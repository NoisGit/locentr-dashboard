import useEntryList from '../hooks/useEntryList'
import EntryListSearch from './EntryListSearch'
import EntryListTableFilter from './EntryListTableFilter'
import cloneDeep from 'lodash/cloneDeep'

const EntryListTableTools = () => {
    const { tableData, setTableData } = useEntryList()

    const handleInputChange = (val: string) => {
        const newTableData = cloneDeep(tableData)
        newTableData.query = val
        newTableData.pageIndex = 1
        setTableData(newTableData)
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <EntryListSearch onInputChange={handleInputChange} />
            <EntryListTableFilter />
        </div>
    )
}

export default EntryListTableTools
