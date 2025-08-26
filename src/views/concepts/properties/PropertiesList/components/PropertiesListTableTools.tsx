// src/views/concepts/properties/PropertiesList/components/PropertiesListTableTools.tsx
import { useCallback, useRef } from 'react'
import usePropertiesList from '../hooks/usePropertiesList'
import PropertiesListSearch from './PropertiesListSearch'
import PropertiesListTableFilter from './PropertiesListTableFilter'

const PropertiesListTableTools = () => {
  const { tableData, setTableData } = usePropertiesList()
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
      <PropertiesListSearch
        onInputChange={handleInputChange}
        inputRef={inputRef}
        defaultValue={tableData?.query ?? ''}
      />
      <PropertiesListTableFilter />
    </div>
  )
}

export default PropertiesListTableTools
