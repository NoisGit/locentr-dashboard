// src/views/concepts/properties/PropertiesList/store/PropertiesListStore.ts
import { create } from 'zustand'
import type { TableQueries as PropertiesTableQueries } from '@/services/PropertiesService'
import type { Property, Filter } from '../types'

export const initialTableData: PropertiesTableQueries = {
  pageIndex: 1,
  pageSize: 10,
  query: '',
  sort: {
    key: 'id',
    order: 'desc',
  },
}

export const initialFilterData: Filter = {
  communityId: '',
}

export type PropertiesListState = {
  tableData: PropertiesTableQueries
  filterData: Filter
  selectedProperty: Partial<Property>[]
  selectedProperties: Property[]
}

type Updater<T> = T | ((prev: T) => T)

type PropertiesListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<PropertiesTableQueries>) => void
  setSelectedProperty: (checked: boolean, property?: Property | null) => void
  setSelectAllProperties: (properties: Property[]) => void
  setSelectedProperties: (properties: Property[]) => void
}

const initialState: PropertiesListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedProperty: [],
  selectedProperties: [],
}

export const usePropertiesListStore = create<PropertiesListState & PropertiesListAction>((set) => ({
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
          ? (payload as (p: PropertiesTableQueries) => PropertiesTableQueries)(state.tableData)
          : payload,
    })),

  // Tolerante: si property es null/undefined, solo asegura arrays y no rompe
  setSelectedProperty: (checked, row) =>
    set((state) => {
      const list = Array.isArray(state.selectedProperties) ? state.selectedProperties : []
      if (!row || (row as any).id === undefined || (row as any).id === null) {
        return { selectedProperties: list, selectedProperty: list }
      }
      const rowId = String((row as any).id)
      const exists = list.some((c: any) => String((c as any).id) === rowId)
      const next = checked
        ? exists
          ? list
          : [...list, row]
        : list.filter((c: any) => String((c as any).id) !== rowId)

      return { selectedProperties: next, selectedProperty: next }
    }),

  setSelectAllProperties: (rows) =>
    set(() => {
      const safe = Array.isArray(rows) ? rows : []
      return { selectedProperties: safe, selectedProperty: safe }
    }),

  setSelectedProperties: (rows) =>
    set(() => {
      const safe = Array.isArray(rows) ? rows : []
      return { selectedProperties: safe, selectedProperty: safe }
    }),
}))
