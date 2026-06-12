import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { LocationsFilter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: { order: '', key: '' },
}

export const initialFilterData: LocationsFilter = {
    query: '',
}

type LocationsListState = {
    tableData: TableQueries
    filterData: LocationsFilter
    setTableData: (payload: TableQueries) => void
    setFilterData: (payload: LocationsFilter) => void
}

export const useLocationsListStore = create<LocationsListState>((set) => ({
    tableData: initialTableData,
    filterData: initialFilterData,
    setTableData: (payload) => set({ tableData: payload }),
    setFilterData: (payload) => set({ filterData: payload }),
}))
