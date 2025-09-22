// src/views/concepts/news/ManageArticle/hooks/useManageArticle.ts
import useSWR from 'swr'
import { useManageArticleStore } from '../store/manageArticleStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetCommunityNews, type TableQueries as NewsQueries } from '@/services/NewsService'
import type { GetArticleListResponse } from '../types'

const useManageArticle = () => {
  const { tableData, filterData } = useManageArticleStore()
  const { selectedId: communityId } = useCommunitiesStore()

  const effectiveParams: NewsQueries = {
    ...(tableData as NewsQueries),
    ...(filterData?.query ? { query: filterData.query } : {}),
  }

  const swrKey =
    communityId != null && communityId !== ''
      ? (['news:list', String(communityId), effectiveParams] as const)
      : null

  const { data, isLoading, error, mutate } = useSWR<GetArticleListResponse>(
    swrKey,
    ([, cid, params]) => apiGetCommunityNews<GetArticleListResponse, NewsQueries>(cid, params as NewsQueries),
    { revalidateOnFocus: false }
  )

  return {
    articleList: data?.list || [],
    articleTotal: data?.total || 0,
    isLoading,
    error,
    mutate,
    tableData,
    filterData,
    communityId,
  }
}

export default useManageArticle
