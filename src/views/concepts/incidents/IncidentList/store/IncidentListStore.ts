// src/views/concepts/incidents/IncidentList/store/IncidentListStore.ts
import { create } from 'zustand'
import type { TableQueries } from '../types'

type CommunityId = string | number | null | ''

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: {
    key: 'created_at',
    order: 'desc',
  },
}

export const initialFilterData: { communityId: CommunityId } = {
  communityId: '',
}

type Updater<T> = T | ((prev: T) => T)

type IncidentListState = {
  query: string
  communityId: CommunityId
  activeTable: {
    data: any[]
    total: number
    tableData: TableQueries
  }
  resolvedTable: {
    data: any[]
    total: number
    tableData: TableQueries
  }
}

type IncidentListActions = {
  setQuery: (q: string) => void
  setCommunityId: (id: CommunityId) => void
  setActiveData: (rows: any[], total: number) => void
  setResolvedData: (rows: any[], total: number) => void
  setActiveTableData: (payload: Updater<Partial<TableQueries>>) => void
  setResolvedTableData: (payload: Updater<Partial<TableQueries>>) => void
}

const initialState: IncidentListState = {
  query: '',
  communityId: initialFilterData.communityId,
  activeTable: {
    data: [],
    total: 0,
    tableData: { ...initialTableData },
  },
  resolvedTable: {
    data: [],
    total: 0,
    tableData: { ...initialTableData },
  },
}

export const useIncidentListStore = create<IncidentListState & IncidentListActions>((set, get) => ({
  ...initialState,

  setQuery: (q) => {
    set({ query: q })
    const { activeTable, resolvedTable } = get()
    set({
      activeTable: {
        ...activeTable,
        tableData: { ...activeTable.tableData, query: q, pageIndex: 1 },
      },
      resolvedTable: {
        ...resolvedTable,
        tableData: { ...resolvedTable.tableData, query: q, pageIndex: 1 },
      },
    })
  },

  setCommunityId: (id) => set({ communityId: id }),

  setActiveData: (rows, total) =>
    set((s) => ({ activeTable: { ...s.activeTable, data: rows, total } })),

  setResolvedData: (rows, total) =>
    set((s) => ({ resolvedTable: { ...s.resolvedTable, data: rows, total } })),

  setActiveTableData: (payload) =>
    set((s) => {
      const prev = s.activeTable.tableData
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => Partial<TableQueries>)(prev)
          : payload
      return {
        activeTable: {
          ...s.activeTable,
          tableData: { ...prev, ...next },
        },
      }
    }),

  setResolvedTableData: (payload) =>
    set((s) => {
      const prev = s.resolvedTable.tableData
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => Partial<TableQueries>)(prev)
          : payload
      return {
        resolvedTable: {
          ...s.resolvedTable,
          tableData: { ...prev, ...next },
        },
      }
    }),
}))
