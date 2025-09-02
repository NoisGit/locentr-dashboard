// src/views/concepts/mailbox/MailboxList/hooks/useMailboxList.ts
import useSWR from 'swr'
import { useMailboxListStore } from '../store/MailboxListStore'
import { apiGetMailboxList, type MailboxTableQueries, MAILBOX_BASE } from '@/services/MailboxService'
import type { GetMailboxListResponse } from '../types'

export default function useMailboxList() {
  const {
    tableData,
    filterData,
    selectedEntry,
    setTableData,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  } = useMailboxListStore((state) => state)

  const baseParams = { ...tableData, ...filterData } as MailboxTableQueries
  const effectiveParams: MailboxTableQueries = {
    ...baseParams,
    communityId: baseParams.communityId ?? 1,
  }
  const swrKey = [MAILBOX_BASE, effectiveParams] as const

  const { data, error, isLoading, mutate } = useSWR<GetMailboxListResponse>(
    swrKey,
    ([, p]) => apiGetMailboxList<GetMailboxListResponse, MailboxTableQueries>(p as MailboxTableQueries),
    { revalidateOnFocus: false },
  )

  const mailboxList = data?.list || []
  const mailboxListTotal = data?.total || 0

  return {
    mailboxList,
    mailboxListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    mutate,
    setTableData,
    selectedEntry,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  }
}
