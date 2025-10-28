// src/views/concepts/collaborators/CollaboratorsList/hooks/useCollaboratorsList.ts
import useSWR from 'swr'
import { useMemo, useEffect } from 'react'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import {
  apiGetCollaboratorsList,
  type GetCollaboratorsListResponse,
  type CollaboratorTableQueries,
} from '@/services/CollaboratorsService'
import { useCollaboratorsListStore } from '../store/CollaboratorsListStore'

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null

function buildKeySig(params: Record<string, unknown>, communityId?: number | string) {
  const p = params as Rec
  const sort = (isRec(p.sort) ? (p.sort as Rec) : {}) as Rec
  return [
    p.pageIndex ?? 1,
    p.pageSize ?? 10,
    p.query ?? '',
    sort.key ?? '',
    sort.order ?? '',
    (p.role ?? '') as string,
    String(p.active ?? ''),
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

  // communityId válido: requerido por el servicio
  const communityId =
    selectedId != null && String(selectedId) !== '' && !Number.isNaN(Number(selectedId))
      ? Number(selectedId)
      : undefined
  const hasCid = communityId != null

  // Params efectivos (incluye filtros role/active como en UI)
  const effectiveParams = useMemo<CollaboratorTableQueries>(() => {
    return {
      pageIndex  : (tableData.pageIndex as number) ?? 1,
      pageSize   : (tableData.pageSize as number) ?? 10,
      query      : (tableData.query as string) ?? '',
      sort       : tableData.sort as CollaboratorTableQueries['sort'],
      communityId: hasCid ? Number(communityId) : '',
      role       : (filterData.role ?? '') as CollaboratorTableQueries['role'],
      active     : (filterData.active ?? '') as CollaboratorTableQueries['active'],
    }
  }, [
    tableData.pageIndex,
    tableData.pageSize,
    tableData.query,
    tableData.sort,
    communityId,
    hasCid,
    filterData.role,
    filterData.active,
  ])

  // Clave estable SOLO con primitivos
  const keySig = buildKeySig(effectiveParams as unknown as Rec, hasCid ? Number(communityId) : '')
  const swrKey = hasCid ? (['collaborators:list', keySig] as const) : null // pausa si no hay comunidad válida

  const { data, error, isLoading, mutate } = useSWR<GetCollaboratorsListResponse>(
    swrKey,
    () => fetchOnce(keySig, effectiveParams),
    {
      keepPreviousData: true,
      revalidateOnMount: true,        // 👈 fuerza fetch al montar / volver de Edit
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,       // mantenemos, pero compensamos con revalidateOnMount: true
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

  // 🔔 Revalidar cuando alguien dispare "collaborators:changed" (create/edit/delete)
  useEffect(() => {
    const onChanged = () => { void mutate() }
    window.addEventListener('collaborators:changed', onChanged as EventListener)
    return () => window.removeEventListener('collaborators:changed', onChanged as EventListener)
  }, [mutate])

  return {
    list,
    total,
    error,
    isLoading,

    tableData,
    filterData,
    selectedCollaborator,
    selectedCollaborators,

    mutate,
    setTableData,
    setFilterData,
    setSelectedCollaborator,
    setSelectedCollaborators,
    setSelectAllCollaborators,
  }
}
