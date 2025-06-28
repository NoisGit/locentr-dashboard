import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Access, Filter } from '../types'

export const initialTableData: TableQueries = {
    pageIndex: 1,
    pageSize: 10,
    query: '',
    sort: {
        order: '',
        key: '',
    },
}

export const initialFilterData: Filter = {
    departamento: [],
    motivo: '',
}

export type AccessListState = {
    tableData: TableQueries
    filterData: Filter
    selectedAccess: Partial<Access>[]
}

type AccessListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedAccess: (checked: boolean, access: Access) => void
    setSelectAllAccess: (accesses: Access[]) => void
}

const initialState: AccessListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedAccess: [],
}

export const useAccessListStore = create<AccessListState & AccessListAction>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedAccess: (checked, row) =>
        set((state) => {
            const prevData = state.selectedAccess
            return checked
                ? { selectedAccess: [...prevData, row] }
                : {
                      selectedAccess: prevData.filter(
                          (prev) => prev.id !== row.id,
                      ),
                  }
        }),
    setSelectAllAccess: (rows) => set(() => ({ selectedAccess: rows })),
}))
