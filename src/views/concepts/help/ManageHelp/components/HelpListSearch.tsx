import DebouceInput from '@/components/shared/DebouceInput'
import { useManageHelpStore } from '../store/manageHelpStore'
import { TbSearch } from 'react-icons/tb'

const HelpListSearch = () => {
    const tableData = useManageHelpStore((state) => state.tableData)
    const setTableData = useManageHelpStore((state) => state.setTableData)

    const handleInputChange = (value: string) => {
        const newTableData = structuredClone(tableData)
        newTableData.query = value
        newTableData.pageIndex = 1

        if (typeof value === 'string') {
            setTableData(newTableData)
        }
    }

    return (
        <DebouceInput
            placeholder="Search..."
            type="text"
            prefix={<TbSearch className="text-lg" />}
            onChange={(e) => handleInputChange(e.target.value)}
        />
    )
}

export default HelpListSearch
