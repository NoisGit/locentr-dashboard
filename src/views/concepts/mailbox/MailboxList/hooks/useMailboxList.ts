// src/views/concepts/mailbox/MailboxList/hooks/useMailboxList.ts
import useSWR from 'swr'
import { useMailboxListStore } from '../store/MailboxListStore'
import {
  apiGetMailboxList,
  type MailboxTableQueries,
  MAILBOX_COMMUNITY_BASE,
} from '@/services/MailboxService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetMailboxListResponse } from '../types'

export default function useMailboxList() {
  const { selectedId: communityId } = useCommunitiesStore()

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
    communityId: communityId ?? baseParams.communityId,
  }

  const swrKey = communityId
    ? ([MAILBOX_COMMUNITY_BASE, communityId, effectiveParams] as const)
    : null

  const { data, error, isLoading, mutate } = useSWR<GetMailboxListResponse>(
    swrKey,
    ([, , p]) =>
      apiGetMailboxList<GetMailboxListResponse, MailboxTableQueries>(p),
    { revalidateOnFocus: false },
  )

  const mailboxList = data?.list ?? []
  const mailboxListTotal = data?.total ?? 0

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
