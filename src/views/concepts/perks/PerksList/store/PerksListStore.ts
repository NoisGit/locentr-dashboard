import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Perk, Filter } from '../types'

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

export type PerksListState = {
    tableData: TableQueries
    filterData: Filter
    selectedPerks: Partial<Perk>[]
}

type PerksListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedPerks: (checked: boolean, perk: Perk) => void
    setSelectAllPerks: (perks: Perk[]) => void
}

const initialState: PerksListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedPerks: [],
}

export const usePerksListStore = create<PerksListState & PerksListAction>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedPerks: (checked, row) =>
        set((state) => {
            const prevData = state.selectedPerks
            return checked
                ? { selectedPerks: [...prevData, row] }
                : {
                      selectedPerks: prevData.filter(
                          (prev) => prev.id !== row.id,
                      ),
                  }
        }),
    setSelectAllPerks: (rows) => set(() => ({ selectedPerks: rows })),
}))
