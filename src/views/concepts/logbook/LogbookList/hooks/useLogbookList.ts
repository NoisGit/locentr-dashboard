// src/views/concepts/logbook/hooks/useLogbookList.ts
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useLogbookListStore } from '../store/LogbookListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { useAuth } from '@/auth'
import { isSuperAdmin } from '@/utils/newsPermissions'
import {
  apiGetCommunityLogbook,
  apiGetAllLogbookAggregated,
  type TableQueries as LogbookQueries,
  type GetLogbookListResponse,
} from '@/services/LogbookService'

const useLogbookList = () => {
  // Store
  const tableData = useLogbookListStore((s) => s.tableData)
  const filterData = useLogbookListStore((s) => s.filterData)
  const selectedLogbookItem = useLogbookListStore((s) => s.selectedLogbookItem)

  const setTableData = useLogbookListStore((s) => s.setTableData)
  const setFilterData = useLogbookListStore((s) => s.setFilterData)
  const setSelectAllLogbook = useLogbookListStore((s) => s.setSelectAllLogbook)
  const setLogbookList = useLogbookListStore((s) => s.setLogbookList)

  // Comunidad seleccionada en el header
  const { selectedId: communityId } = useCommunitiesStore()

  // Permisos
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(undefined, user)

  // Unificamos la query: prioridad tableData.query (lo que usa tu Search),
  // con fallback a filterData.query si existe.
  const unifiedQuery = useMemo(() => {
    const fromTable = (tableData as any)?.query
    const fromFilter = (filterData as any)?.query
    const q =
      (typeof fromTable === 'string' && fromTable.trim() !== '' && fromTable) ||
      (typeof fromFilter === 'string' && fromFilter.trim() !== '' && fromFilter) ||
      undefined
    return q
  }, [tableData, filterData])

  // Parámetros efectivos (mismo shape que News)
  const effectiveParams: LogbookQueries = useMemo(() => {
    const sortKey =
      tableData.sort?.key !== undefined && tableData.sort?.key !== null
        ? String(tableData.sort.key)
        : undefined
    const sortOrder = (tableData.sort?.order as 'asc' | 'desc' | undefined) ?? undefined

    return {
      pageIndex: Number(tableData.pageIndex),
      pageSize: Number(tableData.pageSize),
      sort: sortKey ? { key: sortKey, order: sortOrder } : undefined,
      query: unifiedQuery,
    }
  }, [
    tableData.pageIndex,
    tableData.pageSize,
    tableData.sort?.key,
    tableData.sort?.order,
    unifiedQuery,
  ])

  // Lógica superadmin vs comunidad
  const listAll = superAdmin && (communityId == null || String(communityId) === '')

  const swrKey =
    listAll
      ? ([
          'logbook:list',
          'all',
          effectiveParams.pageIndex,
          effectiveParams.pageSize,
          effectiveParams.sort?.key ?? '',
          effectiveParams.sort?.order ?? '',
          effectiveParams.query ?? '',
        ] as const)
      : communityId != null && String(communityId) !== ''
      ? ([
          'logbook:list',
          String(communityId),
          effectiveParams.pageIndex,
          effectiveParams.pageSize,
          effectiveParams.sort?.key ?? '',
          effectiveParams.sort?.order ?? '',
          effectiveParams.query ?? '',
        ] as const)
      : null

  const fetcher = useCallback(() => {
    if (listAll) {
      return apiGetAllLogbookAggregated<GetLogbookListResponse, LogbookQueries>(effectiveParams)
    }
    return apiGetCommunityLogbook<GetLogbookListResponse, LogbookQueries>(
      String(communityId),
      effectiveParams,
    )
  }, [listAll, communityId, effectiveParams])

  const swr = useSWR<GetLogbookListResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: true,
    dedupingInterval: 2000,
  })

  return {
    // datos
    logbookList: swr.data?.list || [],
    logbookListTotal: swr.data?.total || 0,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,

    // store
    tableData,
    filterData,
    selectedLogbookItem,
    setTableData,
    setFilterData,
    setSelectAllLogbook,
    setLogbookList,

    // contexto
    communityId,
    superAdmin,
  }
}

export default useLogbookList
