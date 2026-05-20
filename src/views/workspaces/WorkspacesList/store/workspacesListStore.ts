import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { WorkspacesFilter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: { order: '', key: '' },
}

export const initialFilterData: WorkspacesFilter = {
    query: '',
}

type WorkspacesListState = {
    tableData: TableQueries
    filterData: WorkspacesFilter
    setTableData: (payload: TableQueries) => void
    setFilterData: (payload: WorkspacesFilter) => void
}

export const useWorkspacesListStore = create<WorkspacesListState>((set) => ({
    tableData: initialTableData,
    filterData: initialFilterData,
    setTableData: (payload) => set({ tableData: payload }),
    setFilterData: (payload) => set({ filterData: payload }),
}))
