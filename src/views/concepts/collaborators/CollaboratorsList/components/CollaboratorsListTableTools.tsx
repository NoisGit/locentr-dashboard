// src/views/concepts/collaborators/CollaboratorsList/components/CollaboratorsListTableTools.tsx
import { useCallback, useRef } from 'react'
import useCollaboratorsList from '../hooks/useCollaboratorsList'
import CollaboratorsListSearch from './CollaboratorsListSearch'
import CollaboratorsListTableFilter from './CollaboratorsListTableFilter'

const CollaboratorsListTableTools = () => {
  const { tableData, setTableData } = useCollaboratorsList()
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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <CollaboratorsListSearch
        defaultValue={tableData?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <CollaboratorsListTableFilter />
    </div>
  )
}

export default CollaboratorsListTableTools
