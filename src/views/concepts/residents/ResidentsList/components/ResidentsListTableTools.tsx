// src/views/concepts/residents/ResidentsList/components/ResidentsListTableTools.tsx
import { useCallback, useRef } from 'react'
import useResidentsList from '../hooks/useResidentsList'
import ResidentsListSearch from './ResidentsListSearch'
import ResidentsListTableFilter from './ResidentsListTableFilter'

const ResidentsListTableTools = () => {
  const { tableData, setTableData } = useResidentsList()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = useCallback((val: string) => {
    setTableData(prev => ({
      ...prev,
      query: val,
      pageIndex: 1,
    }))
  }, [setTableData])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <ResidentsListSearch
        defaultValue={tableData?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <ResidentsListTableFilter />
    </div>
  )
}

export default ResidentsListTableTools
