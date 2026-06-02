import useSWR from 'swr'
import {
    apiGetLocationsList,
    type GetLocationsListResponse,
    type TableQueries as LocationsTableQueries,
} from '@/services/LocationsService'
import { useLocationsListStore } from '../store/locationsListStore'
import type { TableQueries } from '@/@types/common'
import type { LocationsFilter } from '../types'

function buildParams(
    tableData: TableQueries,
    filterData: LocationsFilter,
): LocationsTableQueries {
    return {
        pageIndex: Number(tableData.pageIndex ?? 1),
        pageSize: Number(tableData.pageSize ?? 10),
        query: String(filterData.query ?? tableData.query ?? ''),
        sort: tableData.sort as LocationsTableQueries['sort'],
    }
}

const SWR_KEY = 'locations:list'

export default function useLocationsList() {
    const { tableData, filterData, setTableData, setFilterData } = useLocationsListStore(
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
        locationsList: data?.list || [],
        locationsListTotal: data?.total || 0,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        setFilterData,
    }
}
