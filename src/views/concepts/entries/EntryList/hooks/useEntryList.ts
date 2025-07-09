import { apiGetEntryList } from '@/services/EntryService'
import useSWR from 'swr'
import { useEntryListStore } from '../store/EntryListStore'
import type { GetEntryListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function useEntryList() {
    const {
        tableData,
        filterData,
        setTableData,
        selectedEntry,
        setSelectedEntry,
        setSelectAllEntries,
        setFilterData,
    } = useEntryListStore((state) => state)

    const { data, error, isLoading, mutate } = useSWR(
        ['/api/entries', { ...tableData, ...filterData }],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, params]) =>
            apiGetEntryList<GetEntryListResponse, TableQueries>(params),
        {
            revalidateOnFocus: false,
        },
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
        setSelectAllEntries,
        setFilterData,
    }
}
