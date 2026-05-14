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

function roleString(row: unknown): string {
  if (!row || typeof row !== 'object') return ''
  const user = row as any
  const name =
    user.role_name ??
    (typeof user.role === 'string' ? user.role : user.role?.name) ??
    user.roleName ??
    ''

  return String(name || '').trim().toLowerCase()
}

function isAdminOrSuperRow(row: unknown): boolean {
  const role = roleString(row)

  if (!role) return false
  if (role.includes('super') && role.includes('admin')) return true
  if (role.includes('admin') && !role.includes('sub')) return true
  if (role === 'administrador' || role === 'super administrador') return true

  return false
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

  const all = data?.list || []
  const usersList = all.filter(isAdminOrSuperRow)
  const usersListTotal = usersList.length

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
