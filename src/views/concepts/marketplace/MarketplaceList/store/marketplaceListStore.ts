import { create } from 'zustand'
import type { TableQueries } from '@/@types/common'
import type { Product, Filter } from '../types'

// Estado inicial para la tabla
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
    minAmount: 0,
    maxAmount: 5000,
    productStatus: 'published',
    productType: ['Bags', 'Cloths', 'Devices', 'Shoes', 'Watches'],
}

export type MarketplaceListState = {
    tableData: TableQueries
    filterData: Filter
    selectedMarketplaceItem: Partial<Product>[]
    marketplaceList: Product[]
}

type MarketplaceListAction = {
    setFilterData: (payload: Filter) => void
    setTableData: (payload: TableQueries) => void
    setSelectedMarketplaceItem: (checked: boolean, item: Product) => void
    setSelectAllMarketplace: (items: Product[]) => void
    setMarketplaceList: (items: Product[]) => void
}

const initialState: MarketplaceListState = {
    tableData: initialTableData,
    filterData: initialFilterData,
    selectedMarketplaceItem: [],
    marketplaceList: [], // sin datos mock
}

export const useMarketplaceListStore = create<
    MarketplaceListState & MarketplaceListAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setTableData: (payload) => set(() => ({ tableData: payload })),
    setSelectedMarketplaceItem: (checked, row) =>
        set((state) => {
            const prevData = state.selectedMarketplaceItem
            if (checked) {
                return { selectedMarketplaceItem: [...prevData, row] }
            } else {
                if (prevData.some((prevItem) => row.id === prevItem.id)) {
                    return {
                        selectedMarketplaceItem: prevData.filter(
                            (prevItem) => prevItem.id !== row.id,
                        ),
                    }
                }
                return { selectedMarketplaceItem: prevData }
            }
        }),
    setSelectAllMarketplace: (rows) =>
        set(() => ({ selectedMarketplaceItem: rows })),
    setMarketplaceList: (items) => set(() => ({ marketplaceList: items })),
}))

export default useMarketplaceListStore
