import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: { order: '', key: '' },
}

type UsersFilter = {
    query?: string
}

type UsersListState = {
    tableData: TableQueries
    filterData: UsersFilter
    setTableData: (payload: TableQueries) => void
    setFilterData: (payload: UsersFilter) => void
}

export const useUsersListStore = create<UsersListState>((set) => ({
    tableData: initialTableData,
    filterData: { query: '' },
    setTableData: (payload) => set({ tableData: payload }),
    setFilterData: (payload) => set({ filterData: payload }),
}))
