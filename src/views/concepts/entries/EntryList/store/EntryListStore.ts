import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Entry, Filter } from '../types'

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
    departamento: [],
    motivo: '',
}

export type EntryListState = {
    tableData: TableQueries
    filterData: Filter
    selectedEntry: Partial<Entry>[]
}

type EntryListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedEntry: (checked: boolean, entry: Entry) => void
    setSelectAllEntry: (entries: Entry[]) => void
}

const initialState: EntryListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedEntry: [],
}

export const useEntryListStore = create<EntryListState & EntryListAction>(
    (set) => ({
        ...initialState,
        setFilterData: (payload) => set(() => ({ filterData: payload })),
        setTableData: (payload) => set(() => ({ tableData: payload })),
        setSelectedEntry: (checked, row) =>
            set((state) => {
                const prevData = state.selectedEntry
                if (checked) {
                    return { selectedEntry: [...prevData, row] }
                } else {
                    return {
                        selectedEntry: prevData.filter(
                            (prevEntry) => prevEntry.id !== row.id,
                        ),
                    }
                }
            }),
        setSelectAllEntry: (rows) => set(() => ({ selectedEntry: rows })),
    }),
)
