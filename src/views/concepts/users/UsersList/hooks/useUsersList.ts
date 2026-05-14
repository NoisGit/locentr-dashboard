import useSWR from 'swr'
import {
  apiGetUsersList,
  type GetUsersListResponse,
  type TableQueries as ServiceTableQueries,
} from '@/services/UsersService'
import { useUsersListStore } from '../store/usersListStore'

function buildParams(tableData: any, filterData: any): ServiceTableQueries {
  const pageIndex = Number(tableData?.pageIndex ?? 1)
  const pageSize = Number(tableData?.pageSize ?? 10)
  const query = String(filterData?.query ?? tableData?.query ?? '')
  const sort = filterData?.sort ?? tableData?.sort ?? undefined

  return { pageIndex, pageSize, query, ...(sort ? { sort } : {}) }
}

const SWR_KEY = 'users:list'

export default function useUsersList() {
  const {
    tableData,
    filterData,
    setTableData,
    selectedUsers,
    setSelectedUser,
    setSelectAllUsers,
    setFilterData,
  } = useUsersListStore((state) => state)

  const swrKey: [string, ServiceTableQueries] = [SWR_KEY, buildParams(tableData, filterData)]

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    ([, params]) =>
      apiGetUsersList<GetUsersListResponse, ServiceTableQueries>(params),
    { revalidateOnFocus: false },
  )

  const usersList = data?.list || []
  const usersListTotal = data?.total ?? usersList.length

  return {
    usersList,
    usersListTotal,
    selectedUsers,
    error,
    isLoading,
    tableData,
    filterData,
    mutate,
    setTableData,
    setSelectedUser,
    setSelectAllUsers,
    setFilterData,
  }
}
