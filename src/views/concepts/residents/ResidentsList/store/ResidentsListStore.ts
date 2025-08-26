// src/views/concepts/residents/ResidentsList/store/ResidentsListStore.ts
import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

export type Resident = {
  id: string | number
  userId: string | number
  propertyId: string | number
  userName?: string
  propertyName?: string
  isOwner?: boolean
  startDate?: string
  endDate?: string
  img?: string
  status?: string
}

export type Filter = {
  propertyId: number | ''
  userId: number | ''
  isOwner: boolean | ''
  startDateFrom?: string
  endDateTo?: string
}

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
  propertyId: '',
  userId: '',
  isOwner: '',
  startDateFrom: undefined,
  endDateTo: undefined,
}

export type ResidentsListState = {
  tableData: TableQueries
  filterData: Filter
  selectedResident: Partial<Resident>[]
  selectedResidents: Resident[]
}

type Updater<T> = T | ((prev: T) => T)

type ResidentsListAction = {
  setFilterData: (payload: Updater<Filter>) => void
  setTableData: (payload: Updater<TableQueries>) => void
  setSelectedResident: (checked: boolean, resident: Resident) => void
  setSelectAllResidents: (rows: Resident[]) => void
  setSelectedResidents: (rows: Resident[]) => void
}

const initialState: ResidentsListState = {
  tableData: initialTableData,
  filterData: initialFilterData,
  selectedResident: [],
  selectedResidents: [],
}

export const useResidentsListStore = create<ResidentsListState & ResidentsListAction>((set) => ({
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

  setSelectedResident: (checked, row) =>
    set((state) => {
      const exists = state.selectedResidents.some((r) => r.id === row.id)
      const next = checked
        ? exists
          ? state.selectedResidents
          : [...state.selectedResidents, row]
        : state.selectedResidents.filter((r) => r.id !== row.id)
      return { selectedResidents: next, selectedResident: next }
    }),

  setSelectAllResidents: (rows) =>
    set(() => ({ selectedResidents: rows, selectedResident: rows })),

  setSelectedResidents: (rows) =>
    set(() => ({ selectedResidents: rows, selectedResident: rows })),
}))
