import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Entry, Filter } from '../types'

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: {
    key: 'id',
    order: 'desc',
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

type Updater<T> = T | ((prev: T) => T)

type EntryListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedEntry: (checked: boolean, entry: Entry) => void
  setSelectAllEntry: (entries: Entry[]) => void
}

const initialState: EntryListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedEntry: [],
}

export const useEntryListStore = create<EntryListState & EntryListAction>((set) => ({
  ...initialState,
  setFilterData: (payload) =>
    set((state) => ({
      filterData: typeof payload === 'function' ? (payload as (p: Filter) => Filter)(state.filterData) : payload,
    })),
  setTableData: (payload) =>
    set((state) => ({
      tableData: typeof payload === 'function' ? (payload as (p: TableQueries) => TableQueries)(state.tableData) : payload,
    })),
  setSelectedEntry: (checked, row) =>
    set((state) => {
      const exists = state.selectedEntry.some((e) => e.id === row.id)
      const next = checked ? (exists ? state.selectedEntry : [...state.selectedEntry, row]) : state.selectedEntry.filter((e) => e.id !== row.id)
      return { selectedEntry: next }
    }),
  setSelectAllEntry: (rows) => set(() => ({ selectedEntry: rows })),
}))
