// src/views/concepts/entries/EntryList/components/EntryListTableTools.tsx
import { useCallback, useRef } from 'react'
import useEntryList from '../hooks/useEntryList'
import EntryListSearch from './EntryListSearch'
import EntryListTableFilter from './EntryListTableFilter'

const EntryListTableTools = () => {
  const { tableData, setTableData } = useEntryList()
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
      <EntryListSearch
        onInputChange={handleInputChange}
        inputRef={inputRef}
        defaultValue={tableData?.query ?? ''}
      />
      <EntryListTableFilter />
    </div>
  )
}

export default EntryListTableTools
