// src/views/concepts/entries/EntryList/hooks/useEntryList.ts
import useSWR from 'swr'
import { useEntryListStore } from '../store/EntryListStore'
import {
  apiGetEntryList,
  type EntryTableQueries,
  ENTRY_BASE,
} from '@/services/EntryService'
import type { GetEntryListResponse } from '../types'

export default function useEntryList() {
  const {
    tableData,
    filterData,
    selectedEntry,
    setTableData,
    setSelectedEntry,
    setSelectAllEntry,
    setFilterData,
  } = useEntryListStore((state) => state)

  const { data, error, isLoading, mutate } = useSWR(
    [ENTRY_BASE, { ...tableData, ...filterData }],
    ([, params]) =>
      apiGetEntryList<GetEntryListResponse, EntryTableQueries>(
        params as EntryTableQueries
      ),
    { revalidateOnFocus: false }
  )

  const entryList = data?.list || []
  const entryListTotal = data?.total || 0

  return {
    entryList,
    entryListTotal,
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
