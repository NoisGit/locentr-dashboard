import { useLogbookListStore } from '../store/logbookListStore'
import type { LogbookEntry } from '../types'

const useLogbookList = () => {
    const {
        tableData,
        filterData,
        setTableData,
        setFilterData,
        selectedLogbookItem,
        setSelectedLogbookItem,
        setSelectAllLogbook,
        logbookList,                // <-- central logbook array from the store
        setLogbookList,             // <-- setter for the main list
    } = useLogbookListStore((state) => state)

    // ---- Simple local filter & pagination ----
    const { pageIndex, pageSize, query } = tableData

    // Local copy for filtering and pagination
    let data = [...logbookList] as LogbookEntry[]

    // Filter by search
    if (query && query.length > 0) {
        data = data.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
        )
    }

    // Pagination
    const start = ((pageIndex || 1) - 1) * (pageSize || 10)
    const end = start + (pageSize || 10)
    const paginated = data.slice(start, end)
    const paginatedList = paginated
    const logbookListTotal = data.length

    // Optional: delete entry
    const deleteLogbookEntry = (id: string) => {
        const newList = logbookList.filter(item => item.id !== id)
        setLogbookList(newList)
    }

    return {
        error: null,
        isLoading: false,
        tableData,
        filterData,
        logbookList: paginatedList,
        logbookListTotal,
        setTableData,
        selectedLogbookItem,
        setSelectedLogbookItem,
        setSelectAllLogbook,
        setFilterData,
        setLogbookList,
        deleteLogbookEntry,
    }
}

export default useLogbookList
