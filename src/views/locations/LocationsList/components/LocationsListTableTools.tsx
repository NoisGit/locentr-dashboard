import { useCallback } from 'react'
import DebouceInput from '@/components/shared/DebouceInput'
import { TbSearch } from 'react-icons/tb'
import cloneDeep from 'lodash/cloneDeep'
import useLocationsList from '../hooks/useLocationsList'

const LocationsListTableTools = () => {
    const { tableData, setTableData } = useLocationsList()

    const handleInputChange = useCallback(
        (value: string) => {
            const nextTableData = cloneDeep(tableData)
            nextTableData.query = value ?? ''
            nextTableData.pageIndex = 1
            setTableData(nextTableData)
        },
        [tableData, setTableData],
    )

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <DebouceInput
                className="w-full md:w-80"
                placeholder="Buscar ubicaciones..."
                aria-label="Buscar ubicaciones"
                suffix={<TbSearch className="text-lg" />}
                onChange={(event) => handleInputChange(event.target.value)}
            />
        </div>
    )
}

export default LocationsListTableTools
