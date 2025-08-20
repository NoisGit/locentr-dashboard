import { useCallback, useRef } from 'react'
import useCondosList from '../hooks/useCondosList'
import CondosListSearch from './CondosListSearch'
import CondosListTableFilter from './CondosListTableFilter'

const CondosListTableTools = () => {
    const { tableData, setTableData } = useCondosList()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleInputChange = useCallback((val: string) => {
        setTableData(prev => ({
            ...prev,
            query: val,
            pageIndex: 1, // al cambiar búsqueda, volvemos a la primera página
        }))
    }, [setTableData])

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CondosListSearch
                onInputChange={handleInputChange}
                inputRef={inputRef}
                defaultValue={tableData?.query ?? ''}
            />
            <CondosListTableFilter />
        </div>
    )
}

export default CondosListTableTools
