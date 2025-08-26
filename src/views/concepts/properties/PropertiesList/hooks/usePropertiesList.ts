import { apiGetPropertiesList } from '@/services/PropertiesService'
import useSWR from 'swr'
import { usePropertiesListStore } from '../store/PropertiesListStore'
import type { GetPropertiesListResponse } from '../types'
import type { TableQueries as PropertiesTableQueries } from '@/services/PropertiesService'

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

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/v1/communities/properties', { ...tableData, ...filterData }],
    ([, params]) =>
      apiGetPropertiesList<GetPropertiesListResponse, PropertiesTableQueries>(params),
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
