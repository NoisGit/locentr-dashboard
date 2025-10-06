import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { LogbookEntry, Filter } from '../types'

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  sort: {
    key: 'id',
    order: 'desc',
  },
}

export const initialFilterData: Filter = {
  query: '',
}

export type LogbookListState = {
  tableData: TableQueries
  filterData: Filter
  selectedLogbookItem: Partial<LogbookEntry>[]
  logbookList: LogbookEntry[]
}

type LogbookListAction = {
  setFilterData: (payload: Partial<Filter> | ((prev: Filter) => Filter)) => void
  setTableData: (
    payload: Partial<TableQueries> | ((prev: TableQueries) => TableQueries),
  ) => void
  setSelectedLogbookItem: (checked: boolean, item: LogbookEntry) => void
  setSelectAllLogbook: (items: LogbookEntry[]) => void
  setLogbookList: (items: LogbookEntry[]) => void
  resetFilters: () => void
}

const initialState: LogbookListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedLogbookItem: [],
  logbookList: [],
}

export const useLogbookListStore = create<LogbookListState & LogbookListAction>()(
  (set) => ({
    ...initialState,

    setFilterData: (payload) =>
      set((state) => ({
        filterData:
          typeof payload === 'function'
            ? (payload as (prev: Filter) => Filter)(state.filterData)
            : { ...state.filterData, ...payload },
      })),

    setTableData: (payload) =>
      set((state) => ({
        tableData:
          typeof payload === 'function'
            ? (payload as (prev: TableQueries) => TableQueries)(state.tableData)
            : { ...state.tableData, ...payload },
      })),

    setSelectedLogbookItem: (checked, row) =>
      set((state) => {
        const prev = state.selectedLogbookItem
        if (checked) {
          if (prev.some((p) => String(p.id) === String(row.id))) return { selectedLogbookItem: prev }
          return { selectedLogbookItem: [...prev, row] }
        }
        return {
          selectedLogbookItem: prev.filter((p) => String(p.id) !== String(row.id)),
        }
      }),

    setSelectAllLogbook: (rows) => set(() => ({ selectedLogbookItem: rows })),

    setLogbookList: (items) => set(() => ({ logbookList: items })),

    resetFilters: () => set(() => ({ filterData: initialFilterData })),
  }),
)
