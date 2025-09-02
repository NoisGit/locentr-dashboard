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

  const customerList = data?.list || []
  const customerListTotal = data?.total || 0

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
