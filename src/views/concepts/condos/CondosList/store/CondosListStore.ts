// src/views/concepts/condos/CondosList/store/CondosListStore.ts
import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Condo, Filter } from '../types'

export const initialTableData: TableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  // Arranca ordenado por recientes primero (id desc)
  sort: {
    key: 'id',
    order: 'desc',
  },
}

// 👇 ahora incluye typeId ('' = todos)
export const initialFilterData: Filter = {
  typeId: '',
  departamento: [],
  motivo: '',
}

export type CondosListState = {
  tableData: TableQueries
  filterData: Filter
  selectedCondo: Partial<Condo>[]
  selectedCondos: Condo[]
}

type Updater<T> = T | ((prev: T) => T)

type CondosListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedCondo: (checked: boolean, condo: Condo) => void
  setSelectAllCondos: (condos: Condo[]) => void
  setSelectedCondos: (condos: Condo[]) => void
}

const initialState: CondosListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedCondo: [],
  selectedCondos: [],
}

export const useCondosListStore = create<CondosListState & CondosListAction>((set) => ({
  ...initialState,

  setFilterData: (payload) =>
    set((state) => ({
      filterData:
        typeof payload === 'function'
          ? (payload as (p: Filter) => Filter)(state.filterData)
          : payload,
    })),

  setTableData: (payload) =>
    set((state) => ({
      tableData:
        typeof payload === 'function'
          ? (payload as (p: TableQueries) => TableQueries)(state.tableData)
          : payload,
    })),

  setSelectedCondo: (checked, row) =>
    set((state) => {
      const exists = state.selectedCondos.some((c) => c.id === row.id)
      const next = checked
        ? (exists ? state.selectedCondos : [...state.selectedCondos, row])
        : state.selectedCondos.filter((c) => c.id !== row.id)
      return { selectedCondos: next, selectedCondo: next }
    }),

  setSelectAllCondos: (rows) => set(() => ({ selectedCondos: rows, selectedCondo: rows })),

  setSelectedCondos: (rows) => set(() => ({ selectedCondos: rows, selectedCondo: rows })),
}))
