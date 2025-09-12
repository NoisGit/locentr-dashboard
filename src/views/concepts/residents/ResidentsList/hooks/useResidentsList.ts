import useSWR from 'swr'
import {
  apiGetResidentsList,
  type GetResidentsListResponse,
  type TableQueries as ResidentsTableQueries,
} from '@/services/ResidentsService'
import { useResidentsListStore } from '../store/ResidentsListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

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

  const { selectedId: communityId } = useCommunitiesStore()

  const effectiveParams: ResidentsTableQueries = {
    ...(tableData as ResidentsTableQueries),
    ...(filterData as Partial<ResidentsTableQueries>),
    communityId: communityId ?? '',
  }

  const swrKey = ['residents:list', effectiveParams, String(communityId ?? '')] as const

  const { data, error, isLoading, mutate } = useSWR<GetResidentsListResponse>(
    swrKey,
    ([, params]) =>
      apiGetResidentsList<GetResidentsListResponse, ResidentsTableQueries>(
        params as ResidentsTableQueries,
      ),
    { revalidateOnFocus: false },
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
