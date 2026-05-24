import useSWR from 'swr'
import {
    apiGetLocationsList,
    type GetLocationsListResponse,
    type TableQueries as LocationsTableQueries,
} from '@/services/LocationsService'
import { useWorkspacesListStore } from '../store/workspacesListStore'
import type { TableQueries } from '@/@types/common'
import type { WorkspacesFilter } from '../types'

function buildParams(
    tableData: TableQueries,
    filterData: WorkspacesFilter,
): LocationsTableQueries {
    return {
        pageIndex: Number(tableData.pageIndex ?? 1),
        pageSize: Number(tableData.pageSize ?? 10),
        query: String(filterData.query ?? tableData.query ?? ''),
        sort: tableData.sort as LocationsTableQueries['sort'],
    }
}

const SWR_KEY = 'workspaces:list'

export default function useWorkspacesList() {
    const { tableData, filterData, setTableData, setFilterData } = useWorkspacesListStore(
        (state) => state,
    )

    const params = buildParams(tableData, filterData)

    const { data, error, isLoading, mutate } = useSWR(
        [SWR_KEY, params] as const,
        ([, requestParams]) =>
            apiGetLocationsList<GetLocationsListResponse, LocationsTableQueries>(requestParams),
        { revalidateOnFocus: false },
    )

    return {
        workspacesList: data?.list || [],
        workspacesListTotal: data?.total || 0,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        setFilterData,
    }
}
