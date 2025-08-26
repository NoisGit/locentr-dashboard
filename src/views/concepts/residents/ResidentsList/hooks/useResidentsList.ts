// src/views/concepts/residents/ResidentsList/hooks/useResidentsList.ts
import useSWR from 'swr'
import {
  apiGetResidentsList,
  type GetResidentsListResponse,
  type TableQueries as ResidentsTableQueries,
} from '@/services/ResidentsService'
import { useResidentsListStore } from '../store/ResidentsListStore'

export default function useResidentsList() {
  const {
    tableData,
    filterData,
    selectedResident,
    selectedResidents,
    setTableData,
    setSelectedResident,
    setSelectedResidents,
    setSelectAllResidents,
    setFilterData,
  } = useResidentsListStore((state) => state)

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/residents', { ...tableData, ...filterData }],
    ([, params]) =>
      apiGetResidentsList<GetResidentsListResponse, ResidentsTableQueries>(params as ResidentsTableQueries),
    { revalidateOnFocus: false }
  )

  const residentsList = data?.list || []
  const residentsListTotal = data?.total || 0

  return {
    residents: residentsList,
    residentsList,
    residentsTotal: residentsListTotal,
    residentsListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    selectedResident,
    selectedResidents,
    mutate,
    setTableData,
    setSelectedResident,
    setSelectedResidents,
    setSelectAllResidents,
    setFilterData,
  }
}
