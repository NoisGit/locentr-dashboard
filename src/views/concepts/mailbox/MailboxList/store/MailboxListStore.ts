// src/views/concepts/mailbox/MailboxList/store/MailboxListStore.ts
import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

/** Filtro flexible para evitar choques con definiciones externas */
type MailboxFilter = Record<string, unknown>

/** Mínimo requerido para selección en tabla */
type Selectable = { id: string | number }

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: { key: 'id', order: 'desc' },
}

export const initialFilterData: MailboxFilter = {
  folder: '',
  subject: '',
  tags: [],
  communityId: undefined,
  propertyId: undefined,
}

export type MailboxListState = {
  tableData: TableQueries
  filterData: MailboxFilter
  selectedEntry: Partial<Selectable>[]
}

type Updater<T> = T | ((prev: T) => T)

type MailboxListAction = {
  setFilterData: (payload: Updater<MailboxFilter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedEntry: (checked: boolean, entry: Selectable) => void
  setSelectAllEntry: (entries: Selectable[]) => void
}

const initialState: MailboxListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedEntry: [],
}

export const useMailboxListStore = create<MailboxListState & MailboxListAction>((set) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => ({
      filterData:
        typeof payload === 'function'
          ? (payload as (p: MailboxFilter) => MailboxFilter)(state.filterData)
          : { ...state.filterData, ...payload },
    })),

  setTableData: (payload) =>
    set((state) => ({
      tableData:
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : { ...state.tableData, ...payload },
    })),

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
}))
