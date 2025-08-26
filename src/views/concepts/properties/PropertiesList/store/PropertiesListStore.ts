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
  setSelectedProperty: (checked: boolean, property: Property) => void
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

  setSelectedProperty: (checked, row) =>
    set((state) => {
      const exists = state.selectedProperties.some((c) => c.id === row.id)
      const next = checked
        ? (exists ? state.selectedProperties : [...state.selectedProperties, row])
        : state.selectedProperties.filter((c) => c.id !== row.id)
      return { selectedProperties: next, selectedProperty: next }
    }),

  setSelectAllProperties: (rows) => set(() => ({ selectedProperties: rows, selectedProperty: rows })),

  setSelectedProperties: (rows) => set(() => ({ selectedProperties: rows, selectedProperty: rows })),
}))
