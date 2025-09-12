import { apiGetPropertiesList } from '@/services/PropertiesService'
import useSWR from 'swr'
import { usePropertiesListStore } from '../store/PropertiesListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import type { GetPropertiesListResponse } from '../types'
import type { TableQueries as PropertiesTableQueries } from '@/services/PropertiesService'
import { useEffect, useMemo } from 'react'

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
  const communityKey = selectedId != null ? String(selectedId) : 'all'

  useEffect(() => {
    setFilterData((prev) => ({
      ...prev,
      communityId: selectedId != null ? String(selectedId) : '',
    }))
  }, [selectedId, setFilterData])

  const swrKey = useMemo(
    () => [
      '/api/v1/communities/properties',
      { ...tableData, ...filterData },
      communityKey,
    ] as const,
    [tableData, filterData, communityKey]
  )

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    ([, params]) =>
      apiGetPropertiesList<GetPropertiesListResponse, PropertiesTableQueries>(
        params as PropertiesTableQueries
      ),
    { revalidateOnFocus: false }
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
