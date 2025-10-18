import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

type InvitationsFilter = Record<string, unknown>
type Selectable = { id: string | number }

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: { key: 'id', order: 'desc' },
}

export const initialFilterData: InvitationsFilter = {
  folder: '',
  subject: '',
  tags: [],
  communityId: undefined,
  propertyId: undefined,
}

export type InvitationsListState = {
  tableData: TableQueries
  filterData: InvitationsFilter
  selectedEntry: Selectable[]
}

type Updater<T> = T | ((prev: T) => T)

export type InvitationsListAction = {
  setFilterData: (payload: Updater<InvitationsFilter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedEntry: (checked: boolean, entry: Selectable) => void
  setSelectAllEntry: (entries: Selectable[]) => void
  resetOnCommunityChange: (communityId: string | number | undefined) => void
}

const initialState: InvitationsListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedEntry: [],
}

export const useInvitationsListStore = create<InvitationsListState & InvitationsListAction>((set) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: InvitationsFilter) => InvitationsFilter)(state.filterData)
          : payload
      return { filterData: { ...state.filterData, ...next } }
    }),

  setTableData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : payload
      return { tableData: { ...state.tableData, ...next } }
    }),

  setSelectedEntry: (checked, row) =>
    set((state) => {
      const exists = state.selectedEntry.some((e) => e.id === row.id)
      const next = checked
        ? exists
          ? state.selectedEntry
          : [...state.selectedEntry, row]
        : state.selectedEntry.filter((e) => e.id !== row.id)
      return { selectedEntry: next }
    }),

  setSelectAllEntry: (rows) => set(() => ({ selectedEntry: rows })),

  resetOnCommunityChange: (communityId) =>
    set((state) => ({
      tableData: { ...state.tableData, pageIndex: 1 },
      filterData: { ...state.filterData, communityId },
      selectedEntry: [],
    })),
}))
