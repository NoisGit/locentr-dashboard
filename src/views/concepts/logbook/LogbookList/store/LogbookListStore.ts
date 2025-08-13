import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { LogbookEntry, Filter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData: Filter = {
    minAmount: 0,
    maxAmount: 5000,
    entryStatus: 'published',
    entryType: ['Incident', 'Announcement', 'Maintenance', 'Note', 'Other'],
}

export type LogbookListState = {
    tableData: TableQueries
    filterData: Filter
    selectedLogbookItem: Partial<LogbookEntry>[]
    logbookList: LogbookEntry[]
}

type LogbookListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedLogbookItem: (checked: boolean, item: LogbookEntry) => void
    setSelectAllLogbook: (items: LogbookEntry[]) => void
    setLogbookList: (items: LogbookEntry[]) => void
}

const initialState: LogbookListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedLogbookItem: [],
    logbookList: [],
}

export const useLogbookListStore = create<
    LogbookListState & LogbookListAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedLogbookItem: (checked, row) =>
        set((state) => {
            const prevData = state.selectedLogbookItem
            if (checked) {
                return { selectedLogbookItem: [...prevData, row] }
            } else {
                if (prevData.some((prevItem) => row.id === prevItem.id)) {
                    return {
                        selectedLogbookItem: prevData.filter(
                            (prevItem) => prevItem.id !== row.id,
                        ),
                    }
                }
                return { selectedLogbookItem: prevData }
            }
        }),
    setSelectAllLogbook: (rows) =>
        set(() => ({ selectedLogbookItem: rows })),
    setLogbookList: (items) =>
        set(() => ({ logbookList: items })),
}))
