// src/views/concepts/mailbox/MailboxList/components/MailboxListTableTools.tsx
import { useCallback, useEffect, useMemo, useRef } from 'react'
import useMailboxList from '../hooks/useMailboxList'
import MailboxListSearch from './MailboxListSearch'
import MailboxListTableFilter from './MailboxListTableFilter'

type Scope = {
  communityId?: number | string
  propertyId?: number | string
}

const MailboxListTableTools = () => {
  const { tableData, filterData, setTableData, setFilterData } = useMailboxList()
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
      <MailboxListSearch
        defaultValue={tableData?.query ?? ''}
        inputRef={inputRef}
        onInputChange={handleInputChange}
      />
      <MailboxListTableFilter />
    </div>
  )
}

export default MailboxListTableTools
