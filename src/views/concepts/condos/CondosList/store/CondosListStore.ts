import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Condo, Filter } from '../types'

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

export type CondosListState = {
    tableData: TableQueries
    filterData: Filter
    selectedCondo: Partial<Condo>[]
    selectedCondos: Condo[]
}

type CondosListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
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
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedCondo: (checked, row) =>
        set((state) => {
            const prevData = state.selectedCondo
            return checked
                ? { selectedCondo: [...prevData, row] }
                : {
                      selectedCondo: prevData.filter(
                          (prev) => prev.id !== row.id,
                      ),
                  }
        }),
    setSelectAllCondos: (rows) =>
        set(() => ({
            selectedCondo: rows,
            selectedCondos: rows,
        })),
    setSelectedCondos: (rows) => set(() => ({ selectedCondos: rows })),
}))
