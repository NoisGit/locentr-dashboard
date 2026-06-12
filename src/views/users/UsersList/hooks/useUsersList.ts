import useSWR from 'swr'
import {
    apiGetUsersList,
    type GetUsersListResponse,
    type TableQueries as UsersTableQueries,
} from '@/services/UsersService'
import { useUsersListStore } from '../store/usersListStore'
import type { TableQueries } from '@/@types/common'
import { useSessionUser } from '@/store/authStore'
import { Role } from '@/utils/rbac/types'

type UsersFilter = {
    query?: string
}

function buildParams(tableData: TableQueries, filterData: UsersFilter): UsersTableQueries {
    return {
        pageIndex: Number(tableData.pageIndex ?? 1),
        pageSize: Number(tableData.pageSize ?? 10),
        query: String(filterData.query ?? tableData.query ?? ''),
    }
}

const SWR_KEY = 'users:list'

export default function useUsersList() {
    const role = useSessionUser((state) => state.user.role)
    const companyId = useSessionUser((state) => state.user.company_id)
    const { tableData, filterData, setTableData, setFilterData } = useUsersListStore(
        (state) => state,
    )

    const params = {
        ...buildParams(tableData, filterData),
        companyId: role === Role.ADMIN ? companyId : undefined,
    }

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
