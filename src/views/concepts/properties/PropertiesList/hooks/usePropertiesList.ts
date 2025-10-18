import { apiGetPropertiesList } from '@/services/PropertiesService'
import useSWR from 'swr'
import { usePropertiesListStore } from '../store/PropertiesListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetPropertiesListResponse } from '../types'
import type { TableQueries as PropertiesTableQueries } from '@/services/PropertiesService'
import { useEffect, useMemo } from 'react'

type SWRKey = readonly [endpoint: string, params: PropertiesTableQueries]

export default function usePropertiesList() {
  const {
    tableData,
    filterData,
    selectedProperty,
    selectedProperties,
    setTableData,
    setSelectedProperty,
    setSelectedProperties,
    setSelectAllProperties,
    setFilterData,
  } = usePropertiesListStore((state) => state)

  const selectedId = useCommunitiesStore((s) => s.selectedId)

  useEffect(() => {
    setFilterData((prev) => ({
      ...prev,
      communityId: selectedId != null ? String(selectedId) : '',
    }))
  }, [selectedId, setFilterData])

  const params = useMemo(() => {
    const merged = { ...tableData, ...filterData } as PropertiesTableQueries
    merged.communityId =
      selectedId != null ? String(selectedId) : (merged.communityId ?? '')
    return merged
  }, [tableData, filterData, selectedId])

  const swrKey: SWRKey = useMemo(
    () => ['/api/v1/communities/properties', params] as const,
    [params],
  )

  const { data, error, isLoading, mutate } = useSWR<
    GetPropertiesListResponse,
    unknown,
    SWRKey
  >(
    swrKey,
    ([, p]) => apiGetPropertiesList<GetPropertiesListResponse, PropertiesTableQueries>(p),
    { revalidateOnFocus: false },
  )

  const propertiesList = data?.list || []
  const propertiesListTotal = data?.total || 0

  return {
    properties: propertiesList,
    propertiesList,
    propertiesTotal: propertiesListTotal,
    propertiesListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    selectedProperty,
    selectedProperties,
    mutate,
    setTableData,
    setSelectedProperty,
    setSelectedProperties,
    setSelectAllProperties,
    setFilterData,
  }
}
