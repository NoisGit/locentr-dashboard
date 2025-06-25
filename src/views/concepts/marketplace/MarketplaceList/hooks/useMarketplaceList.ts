import { useMarketplaceListStore } from '../store/marketplaceListStore'
import type { Product } from '../types'

const useMarketplaceList = () => {
    const {
        tableData,
        filterData,
        setTableData,
        setFilterData,
        selectedMarketplaceItem,
        setSelectedMarketplaceItem,
        setSelectAllMarketplace,
        marketplaceList,                // <-- toma el array centralizado del store
        setMarketplaceList,             // <-- acción para setear la lista real
    } = useMarketplaceListStore((state) => state)

    // ---- Simple paginado y filtro local ----
    const { pageIndex, pageSize, query } = tableData

    // Copia local para filtrar y paginar
    let data = [...marketplaceList] as Product[]

    // Filtro búsqueda
    if (query && query.length > 0) {
        data = data.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase())
        )
    }

    // Paginado simple
    const start = ((pageIndex || 1) - 1) * (pageSize || 10)
    const end = start + (pageSize || 10)
    const paginated = data.slice(start, end)
    const paginatedList = paginated
    const marketplaceListTotal = data.length

    // Agrega función para eliminar (opcionalmente, puedes ponerla aquí o usarla directo desde el componente)
    const deleteMarketplaceItem = (id: string) => {
        const newList = marketplaceList.filter(item => item.id !== id)
        setMarketplaceList(newList)
    }

    return {
        error: null,
        isLoading: false,
        tableData,
        filterData,
        marketplaceList: paginatedList,
        marketplaceListTotal,
        setTableData,
        selectedMarketplaceItem,
        setSelectedMarketplaceItem,
        setSelectAllMarketplace,
        setFilterData,
        setMarketplaceList,     // <- para modificar desde la tabla
        deleteMarketplaceItem,  // <- para borrar directo
    }
}

export default useMarketplaceList
