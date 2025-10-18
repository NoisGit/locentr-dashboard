import { useCallback, useEffect, useMemo, useRef } from 'react'
import useInvitationsList from '../hooks/useInvitationsList'
import InvitationsListSearch from './InvitationsListSearch'
import InvitationsListTableFilter from './InvitationsListTableFilter'

type Scope = {
  communityId?: number | string
  propertyId?: number | string
}

const InvitationsListTableTools = () => {
  const { tableData, filterData, setTableData, setFilterData } = useInvitationsList()
  const inputRef = useRef<HTMLInputElement>(null)

  const scope = useMemo<Scope>(() => (filterData as unknown as Scope), [filterData])

  useEffect(() => {
    if (scope.communityId == null) {
      setFilterData((prev) => ({ ...(prev as object), communityId: 1 } as unknown as typeof prev))
    }
  }, [scope.communityId, setFilterData])

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
      <InvitationsListSearch
        defaultValue={tableData?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <InvitationsListTableFilter />
    </div>
  )
}

export default InvitationsListTableTools
