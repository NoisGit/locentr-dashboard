// src/views/concepts/incidents/IncidentList/hooks/useIncidentList.ts
import useSWR from 'swr'
import { useMemo } from 'react'
import { apiGetIncidentsList } from '@/services/IncidentsService'
import { useIncidentListStore } from '../store/IncidentListStore'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { useAuth } from '@/auth'
import { isSuperAdmin } from '@/utils/newsPermissions'
import type {
  GetIncidentsListResponse,
  TableQueries as ServiceTableQueries,
  IncidentRow,
} from '@/services/IncidentsService'

type Section = 'active' | 'resolved'

type Params = {
  statusIn?: Array<'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED' | string>
  section: Section
}

function norm(s?: string) {
  return (s ?? '').toString().trim().toUpperCase()
}

const CLOSED_SET = new Set(['CLOSED', 'RESOLVED'])
const ACTIVE_SET = new Set(['OPEN', 'PENDING', 'IN_PROGRESS'])

export default function useIncidentList({ statusIn, section }: Params) {
  const { user } = useAuth()
  const superAdmin = isSuperAdmin(undefined, user)

  const tableSlice = useIncidentListStore((s) => (section === 'active' ? s.activeTable : s.resolvedTable))
  const tableData = tableSlice.tableData as ServiceTableQueries

  const selectedId = useCommunitiesStore((s) => s.selectedId)

  const explicitCommunityId =
    tableData && ('communityId' in tableData) && tableData.communityId !== '' && tableData.communityId != null
      ? String(tableData.communityId as string | number)
      : ''

  const storeCommunityId = selectedId != null ? String(selectedId) : ''

  const effectiveCommunityId = explicitCommunityId || storeCommunityId

  const pageIndex = Number(tableData?.pageIndex ?? 1)
  const pageSize = Number(tableData?.pageSize ?? 10)
  const query = tableData?.query ?? ''
  const sort = tableData?.sort

  const wantedClientSet = useMemo(() => {
    if (Array.isArray(statusIn) && statusIn.length) {
      return new Set(statusIn.map((x) => norm(x)))
    }
    return section === 'resolved' ? CLOSED_SET : ACTIVE_SET
  }, [statusIn, section])

  const backendStatusIn: ReadonlyArray<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'> = useMemo(() => {
    return section === 'resolved' ? ['RESOLVED'] : ['PENDING', 'IN_PROGRESS']
  }, [section])

  const listAll = superAdmin && effectiveCommunityId === ''

  const serviceParams: ServiceTableQueries = useMemo(
    () => ({
      pageIndex,
      pageSize,
      query,
      sort,
      // Para super admin sin comunidad seleccionada, dejamos '' para que el service use /all
      communityId: listAll ? '' : effectiveCommunityId,
      status_in: backendStatusIn.slice() as ServiceTableQueries['status_in'],
    }),
    [pageIndex, pageSize, query, sort, effectiveCommunityId, backendStatusIn, listAll],
  )

  const swrKey: string | null = useMemo(() => {
    if (!listAll && effectiveCommunityId === '') return null
    const cid = listAll ? 'all' : effectiveCommunityId
    const sortKey = sort?.key ?? ''
    const sortOrder = sort?.order ?? ''
    return `incidents:${section}:pi=${pageIndex}:ps=${pageSize}:q=${query}:sk=${sortKey}:so=${sortOrder}:cid=${cid}:st=${backendStatusIn.join(',')}`
  }, [listAll, effectiveCommunityId, section, pageIndex, pageSize, query, sort, backendStatusIn])

  const { data, error, isLoading, mutate } = useSWR<GetIncidentsListResponse>(
    swrKey,
    () => apiGetIncidentsList<GetIncidentsListResponse, ServiceTableQueries>(serviceParams),
    { revalidateOnFocus: false },
  )

  const items = useMemo(() => {
    const list = (data?.list ?? []) as IncidentRow[]
    if (!list.length) return list
    return list.map((r) => ({ ...r, status: norm(r.status as string) })).filter((r) => wantedClientSet.has(r.status))
  }, [data?.list, wantedClientSet])

  const total = data?.total ?? 0

  return {
    loading: isLoading,
    error,
    items,
    total,
    tableData,
    actions: { mutate },
  }
}
