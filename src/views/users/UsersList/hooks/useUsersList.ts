import useSWR from 'swr'
import {
    apiGetUsersList,
    type GetUsersListResponse,
    type TableQueries as UsersTableQueries,
} from '@/services/UsersService'
import { useUsersListStore } from '../store/usersListStore'

function buildParams(tableData: any, filterData: any): UsersTableQueries {
    return {
        pageIndex: Number(tableData?.pageIndex ?? 1),
        pageSize: Number(tableData?.pageSize ?? 10),
        query: String(filterData?.query ?? tableData?.query ?? ''),
        sort: tableData?.sort,
    }
}

const SWR_KEY = 'users:list'

export default function useUsersList() {
    const {
        tableData,
        filterData,
        setTableData,
        setFilterData,
    } = useUsersListStore((state) => state)

    const params = buildParams(tableData, filterData)

    const { data, error, isLoading, mutate } = useSWR(
        [SWR_KEY, params] as const,
        ([, requestParams]) =>
            apiGetUsersList<GetUsersListResponse, UsersTableQueries>(requestParams),
        { revalidateOnFocus: false },
    )

    return {
        usersList: data?.list || [],
        usersListTotal: data?.total || 0,
        error,
        isLoading,
        tableData,
        filterData,
        mutate,
        setTableData,
        setFilterData,
    }
}
