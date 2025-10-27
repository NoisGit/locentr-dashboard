// src/views/concepts/collaborators/CollaboratorsList/hooks/useCollaboratorsList.ts
import useSWR from 'swr'
import { useMemo, useEffect } from 'react'
import { useCommunitiesStore, isVirtualCommunityId } from '@/store/communities/CommunitiesStore'
import {
  apiGetCollaboratorsList,
  type GetCollaboratorsListResponse,
  type CollaboratorTableQueries,
} from '@/services/CollaboratorsService'
import { useCollaboratorsListStore } from '../store/CollaboratorsListStore'

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null

function buildKeySig(
  params: Record<string, unknown>,
  communityId?: number | string,
) {
  const p = params as Rec
  return [
    p.pageIndex ?? 1,
    p.pageSize ?? 10,
    p.query ?? '',
    (isRec(p.sort) ? (p.sort as Rec).key : '') ?? '',
    (isRec(p.sort) ? (p.sort as Rec).order : '') ?? '',
    communityId ?? '',
  ].join('|')
}

/* Dedupe a nivel de fetcher: 1 request por keySig */
const inFlight = new Map<string, Promise<GetCollaboratorsListResponse>>()
function fetchOnce(keySig: string, params: CollaboratorTableQueries) {
  const existing = inFlight.get(keySig)
  if (existing) return existing
  const p = apiGetCollaboratorsList(params).finally(() => {
    inFlight.delete(keySig)
  })
  inFlight.set(keySig, p)
  return p
}

export default function useCollaboratorsList() {
  const {
    tableData,
    filterData,
    selectedCollaborator,
    selectedCollaborators,
    setTableData,
    setFilterData,
    setSelectedCollaborator,
    setSelectedCollaborators,
    setSelectAllCollaborators,
  } = useCollaboratorsListStore()

  // Comunidad desde el selector del header
  const { selectedId } = useCommunitiesStore()

  // Ignorar IDs virtuales como "__SUPER__"
  const selectedForFilter =
    selectedId != null && !isVirtualCommunityId(selectedId) && String(selectedId) !== ''
      ? Number(selectedId)
      : undefined

  // Prioridad: header -> filtro del módulo
  const communityId =
    selectedForFilter != null
      ? selectedForFilter
      : (filterData.communityId as number | undefined)

  const hasCid =
    communityId !== '' &&
    communityId != null &&
    !Number.isNaN(Number(communityId))

  // Params efectivos (solo deps que cambian realmente)
  const effectiveParams = useMemo<CollaboratorTableQueries>(() => {
    return {
      pageIndex : (tableData.pageIndex as number) ?? 1,
      pageSize  : (tableData.pageSize as number) ?? 10,
      query     : (tableData.query as string) ?? '',
      sort      : tableData.sort as CollaboratorTableQueries['sort'],
      communityId: hasCid ? Number(communityId) : '', // el servicio exige communityId válido
    }
  }, [tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort, communityId, hasCid])

  // Clave estable SOLO con primitivos
  const keySig = buildKeySig(effectiveParams as unknown as Rec, hasCid ? Number(communityId) : '')
  const swrKey = hasCid ? (['collaborators:list', keySig] as const) : null // pausa si no hay comunidad válida

  const { data, error, isLoading, mutate } = useSWR<GetCollaboratorsListResponse>(
    swrKey,
    () => fetchOnce(keySig, effectiveParams),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      dedupingInterval: 1500,
    },
  )

  const list  = data?.list ?? []
  const total = typeof data?.total === 'number' ? data.total : list.length

  /* ---------- UX ---------- */

  // Si cambia comunidad: page 1 + limpiar selección
  useEffect(() => {
    if (!hasCid) return
    setTableData((prev) => ({ ...prev, pageIndex: 1 }))
    setSelectAllCollaborators([])
    setSelectedCollaborators([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, hasCid])

  // Si quedamos en página vacía, saltar a última válida
  useEffect(() => {
    const pageIndex = Number(tableData.pageIndex ?? 1)
    const pageSize  = Number(tableData.pageSize ?? 10)
    const hasData   = list.length > 0
    const lastPage  = Math.max(1, Math.ceil((Number(total) || 0) / pageSize))

    if (!isLoading && !hasData && total > 0 && pageIndex > lastPage) {
      setTableData((prev) => ({ ...prev, pageIndex: lastPage }))
    }
  }, [isLoading, list.length, total, tableData.pageIndex, tableData.pageSize, setTableData])

  return {
    list,
    total,
    error,
    isLoading,

    tableData,
    filterData,
    selectedCollaborator,
    selectedCollaborators,

    mutate, // refresco manual cuando lo necesites
    setTableData,
    setFilterData,
    setSelectedCollaborator,
    setSelectedCollaborators,
    setSelectAllCollaborators,
  }
}
