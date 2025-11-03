// src/views/concepts/accesspoints/AccessPointsList/store/AccessPointsListStore.ts
import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

/* ========== Tipos ========== */

export type AccessPoint = {
  id: string | number
  name: string
  role?: string
  community?: string
  location?: string
  active?: boolean
}

export type Filter = {
  /** Filtrado por comunidad (desde el selector del header también llega) */
  communityId: number | ''
}

/* ========== Estados iniciales ========== */

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: { key: 'id', order: 'desc' },
}

export const initialFilterData: Filter = {
  communityId: '',
}

/* ========== Utils ========== */

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T) {
  if (a === b) return true
  const ak = Object.keys(a)
  const bk = Object.keys(b)
  if (ak.length !== bk.length) return false
  for (const k of ak) {
    // @ts-expect-error index
    if (a[k] !== b[k]) return false
  }
  return true
}

type Updater<T> = T | ((prev: T) => T)

/* ========== Estado + Acciones ========== */

export type AccessPointsListState = {
  tableData: TableQueries
  filterData: Filter
  /** Selección (singular) mantenida como arreglo para consistencia con otros módulos */
  selectedItem: Partial<AccessPoint>[]
  selectedItems: AccessPoint[]
}

export type AccessPointsListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedItem: (checked: boolean, row: AccessPoint) => void
  setSelectAllItems: (rows: AccessPoint[]) => void
  setSelectedItems: (rows: AccessPoint[]) => void
  /** Útil para hacer un solo set cuando cambia la comunidad */
  resetForCommunity: () => void
}

const initialState: AccessPointsListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedItem: [],
  selectedItems: [],
}

/* ========== Store ========== */

export const useAccessPointsListStore = create<
  AccessPointsListState & AccessPointsListAction
>((set, get) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: Filter) => Filter)(state.filterData)
          : payload
      const merged = { ...state.filterData, ...next }
      if (shallowEqual(merged, state.filterData)) return state
      return { filterData: merged }
    }),

  setTableData: (payload) =>
    set((state) => {
      const next =
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : payload

      // normalización simple
      const pageIndex = Math.max(1, Number(next.pageIndex ?? state.tableData.pageIndex))
      const pageSize  = Math.max(1, Number(next.pageSize  ?? state.tableData.pageSize))
      const merged: TableQueries = {
        ...state.tableData,
        ...next,
        pageIndex,
        pageSize,
      }

      if (shallowEqual(merged as Record<string, unknown>, state.tableData as Record<string, unknown>)) {
        return state
      }
      return { tableData: merged }
    }),

  setSelectedItem: (checked, row) =>
    set((state) => {
      const current = Array.isArray(state.selectedItems)
        ? state.selectedItems
        : []
      const exists = current.some((r) => r.id === row.id)
      const next = checked
        ? (exists ? current : [...current, row])
        : current.filter((r) => r.id !== row.id)

      if (next === state.selectedItems) return state
      return {
        selectedItems: next,
        selectedItem: next,
      }
    }),

  setSelectAllItems: (rows) =>
    set((state) => {
      if (rows === state.selectedItems) return state
      return {
        selectedItems: rows,
        selectedItem: rows,
      }
    }),

  setSelectedItems: (rows) =>
    set((state) => {
      if (rows === state.selectedItems) return state
      return {
        selectedItems: rows,
        selectedItem: rows,
      }
    }),

  resetForCommunity: () =>
    set((state) => {
      const nextTable = { ...state.tableData, pageIndex: 1 }
      if (
        shallowEqual(nextTable as Record<string, unknown>, state.tableData as Record<string, unknown>) &&
        state.selectedItems.length === 0 &&
        state.selectedItem.length === 0
      ) {
        return state
      }
      return {
        tableData: nextTable,
        selectedItems: [],
        selectedItem: [],
      }
    }),
}))
