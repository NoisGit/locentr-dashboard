// src/views/concepts/accesspoints/AccessPointsList/components/AccessPointsListTableTools.tsx
import { useCallback, useRef } from 'react'
import useAccessPointsList from '../hooks/useAccessPointsList'
import AccessPointsListSearch from './AccessPointsListSearch'
import AccessPointsListTableFilter from './AccessPointsListTableFilter'

const AccessPointsListTableTools = () => {
  const { tableData, setTableData } = useAccessPointsList()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = useCallback(
    (val: string) => {
      setTableData((prev) => ({
        ...prev,
        query: val,
        pageIndex: 1,
      }))
    },
    [setTableData],
  )

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <AccessPointsListSearch
        defaultValue={tableData?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <AccessPointsListTableFilter />
    </div>
  )
}

export default AccessPointsListTableTools
