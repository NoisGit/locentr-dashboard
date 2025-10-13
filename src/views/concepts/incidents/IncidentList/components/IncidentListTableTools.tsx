// src/views/concepts/incidents/IncidentList/components/IncidentListTableTools.tsx
import { useCallback, useRef } from 'react'
import { useIncidentListStore } from '../store/IncidentListStore'
import IncidentListSearch from './IncidentListSearch'
import IncidentListTableFilter from './IncidentListTableFilter'

const IncidentListTableTools = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTable = useIncidentListStore((s) => s.activeTable.tableData)
  const setQuery = useIncidentListStore((s) => s.setQuery)

  const handleInputChange = useCallback(
    (val: string) => {
      const q = typeof val === 'string' ? val : ''
      if (q.length > 1 || q.length === 0) {
        setQuery(q)
      }
    },
    [setQuery],
  )

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <IncidentListSearch
        defaultValue={activeTable?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <IncidentListTableFilter />
    </div>
  )
}

export default IncidentListTableTools
