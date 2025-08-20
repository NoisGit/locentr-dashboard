// src/views/concepts/condos/CondosList/hooks/useCondosList.ts
import { apiGetCondosList } from '@/services/CondosService'
import useSWR from 'swr'
import { useCondosListStore } from '../store/CondosListStore'
import type { GetCondosListResponse } from '../types'
import type { TableQueries } from '@/@types/common'

export default function useCondosList() {
  const {
    tableData,
    filterData,
    selectedCondo,
    selectedCondos,
    setTableData,
    setSelectedCondo,
    setSelectedCondos,
    setSelectAllCondos,
    setFilterData,
  } = useCondosListStore((state) => state)

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/communities', { ...tableData, ...filterData }],
    ([, params]) =>
      apiGetCondosList<GetCondosListResponse, TableQueries>(params),
    { revalidateOnFocus: false },
  )

  const condosList = data?.list || []
  const condosListTotal = data?.total || 0

  return {
    condos: condosList,
    condosList,
    condosTotal: condosListTotal,
    condosListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    selectedCondo,
    selectedCondos,
    mutate,
    setTableData,
    setSelectedCondo,
    setSelectedCondos,
    setSelectAllCondos,
    setFilterData,
  }
}
