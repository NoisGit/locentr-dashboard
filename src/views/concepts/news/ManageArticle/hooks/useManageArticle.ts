// src/views/concepts/news/ManageArticle/hooks/useManageArticle.ts
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useManageArticleStore } from '../store/manageArticleStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import {
  apiGetCommunityNews,
  apiGetAllNewsAggregated,
  type TableQueries as NewsQueries,
  type GetArticleListResponse,
} from '@/services/NewsService'
import { useAuth } from '@/auth'
import { isSuperAdmin } from '@/utils/newsPermissions'

const useManageArticle = () => {
  const { tableData, filterData } = useManageArticleStore()
  const { selectedId: communityId } = useCommunitiesStore()
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(undefined, user)

  const effectiveParams: NewsQueries = useMemo(() => {
    const sortKey =
      tableData.sort?.key !== undefined && tableData.sort?.key !== null
        ? String(tableData.sort.key)
        : undefined
    const sortOrder = (tableData.sort?.order as 'asc' | 'desc' | undefined) ?? undefined

    return {
      pageIndex: Number(tableData.pageIndex),
      pageSize: Number(tableData.pageSize),
      sort: sortKey ? { key: sortKey, order: sortOrder } : undefined,
      query: filterData?.query || undefined,
    }
  }, [
    tableData.pageIndex,
    tableData.pageSize,
    tableData.sort?.key,
    tableData.sort?.order,
    filterData?.query,
  ])

  const listAll = superAdmin && (communityId == null || String(communityId) === '')

  const swrKey =
    listAll
      ? ([
          'news:list',
          'all',
          effectiveParams.pageIndex,
          effectiveParams.pageSize,
          effectiveParams.sort?.key ?? '',
          effectiveParams.sort?.order ?? '',
          effectiveParams.query ?? '',
        ] as const)
      : communityId != null && String(communityId) !== ''
      ? ([
          'news:list',
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
      return apiGetAllNewsAggregated<GetArticleListResponse, NewsQueries>(effectiveParams)
    }
    return apiGetCommunityNews<GetArticleListResponse, NewsQueries>(
      String(communityId),
      effectiveParams,
    )
  }, [listAll, communityId, effectiveParams])

  const swr = useSWR<GetArticleListResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: true,
    dedupingInterval: 2000,
  })

  return {
    articleList: swr.data?.list || [],
    articleTotal: swr.data?.total || 0,
    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: swr.error,
    mutate: swr.mutate,
    tableData,
    filterData,
    communityId,
  }
}

export default useManageArticle
