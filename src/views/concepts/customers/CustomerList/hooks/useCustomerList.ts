// src/views/concepts/users/CustomerList/hooks/useCustomerList.ts
import useSWR from 'swr'
import {
  apiGetCustomersList,
  type GetCustomersListResponse,
  type TableQueries as ServiceTableQueries,
} from '@/services/CustomersService'
import { useCustomerListStore } from '../store/customerListStore'

function buildParams(tableData: any, filterData: any): ServiceTableQueries {
  const pageIndex = Number(tableData?.pageIndex ?? 1)
  const pageSize = Number(tableData?.pageSize ?? 10)
  const query = String(filterData?.query ?? tableData?.query ?? '')
  const sort = filterData?.sort ?? tableData?.sort ?? undefined
  return { pageIndex, pageSize, query, ...(sort ? { sort } : {}) }
}

function roleString(row: unknown): string {
  if (!row || typeof row !== 'object') return ''
  const r: any = row as any
  const name =
    r.role_name ??
    (typeof r.role === 'string' ? r.role : r.role?.name) ??
    r.roleName ??
    ''
  return String(name || '').trim().toLowerCase()
}

function isAdminOrSuperRow(row: unknown): boolean {
  const r = roleString(row)
  if (!r) return false
  if (r.includes('super') && r.includes('admin')) return true
  if (r.includes('admin') && !r.includes('sub')) return true
  if (r === 'administrador' || r === 'super administrador') return true
  return false
}

const SWR_KEY = 'users:list'

export default function useCustomerList() {
  const {
    tableData,
    filterData,
    setTableData,
    selectedCustomer,
    setSelectedCustomer,
    setSelectAllCustomer,
    setFilterData,
  } = useCustomerListStore((state) => state)

  const swrKey: [string, ServiceTableQueries] = [SWR_KEY, buildParams(tableData, filterData)]

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    ([, params]) =>
      apiGetCustomersList<GetCustomersListResponse, ServiceTableQueries>(params),
    { revalidateOnFocus: false },
  )

  const all = data?.list || []
  const customerList = all.filter(isAdminOrSuperRow)
  const customerListTotal = customerList.length

  return {
    customerList,
    customerListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    mutate,
    setTableData,
    selectedCustomer,
    setSelectedCustomer,
    setSelectAllCustomer,
    setFilterData,
  }
}
