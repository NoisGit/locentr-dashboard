// src/views/concepts/accesspoints/AccessPointsList/hooks/useAccessPointsList.ts
import useSWR from 'swr'
import { useMemo, useEffect } from 'react'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import {
  apiGetAccessPointsList,
  type GetAccessPointsListResponse,
  type AccessPointTableQueries,
} from '@/services/AccessPointsService'
import { useAccessPointsListStore } from '../store/AccessPointsListStore'

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
    communityId ?? '',
  ].join('|')
}

/* Dedupe por keySig: solo 1 request concurrente por combinación de parámetros */
const inFlight = new Map<string, Promise<GetAccessPointsListResponse>>()
function fetchOnce(keySig: string, params: AccessPointTableQueries) {
  const existing = inFlight.get(keySig)
  if (existing) return existing
  const p = apiGetAccessPointsList(params).finally(() => {
    inFlight.delete(keySig)
  })
  inFlight.set(keySig, p)
  return p
}

export default function useAccessPointsList() {
  const {
    tableData,
    filterData,
    // nombres del store (mantenerlos así)
    selectedItem: selectedAccessPoint,
    selectedItems: selectedAccessPoints,
    setTableData,
    setFilterData,
    setSelectedItem: setSelectedAccessPoint,
    setSelectedItems: setSelectedAccessPoints,
    setSelectAllItems: setSelectAllAccessPoints,
  } = useAccessPointsListStore()

  // Comunidad actual desde el header
  const { selectedId } = useCommunitiesStore()
  const communityId =
    selectedId != null && String(selectedId) !== '' && !Number.isNaN(Number(selectedId))
      ? Number(selectedId)
      : undefined
  const hasCid = communityId != null

  // Parámetros efectivos para el service
  const effectiveParams = useMemo<AccessPointTableQueries>(
    () => ({
      pageIndex: (tableData.pageIndex as number) ?? 1,
      pageSize : (tableData.pageSize as number) ?? 10,
      query    : (tableData.query as string) ?? '',
      sort     : tableData.sort as AccessPointTableQueries['sort'],
      communityId: hasCid ? Number(communityId) : '',
    }),
    [tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort, communityId, hasCid],
  )

  // Clave SWR estable (solo primitivos)
  const keySig = buildKeySig(effectiveParams as unknown as Rec, hasCid ? Number(communityId) : '')
  const swrKey = hasCid ? (['accesspoints:list', keySig] as const) : null

  const { data, error, isLoading, mutate } = useSWR<GetAccessPointsListResponse>(
    swrKey,
    () => fetchOnce(keySig, effectiveParams),
    {
      keepPreviousData: true,
      revalidateOnMount: true,
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

  // Si cambia comunidad: ir a pág. 1 y limpiar selección
  useEffect(() => {
    if (!hasCid) return
    setTableData((prev) => ({ ...prev, pageIndex: 1 }))
    setSelectAllAccessPoints([])
    setSelectedAccessPoints([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, hasCid])

  // Si la página actual queda vacía, saltar a la última válida
  useEffect(() => {
    const pageIndex = Number(tableData.pageIndex ?? 1)
    const pageSize  = Number(tableData.pageSize ?? 10)
    const hasData   = list.length > 0
    const lastPage  = Math.max(1, Math.ceil((Number(total) || 0) / pageSize))

    if (!isLoading && !hasData && total > 0 && pageIndex > lastPage) {
      setTableData((prev) => ({ ...prev, pageIndex: lastPage }))
    }
  }, [isLoading, list.length, total, tableData.pageIndex, tableData.pageSize, setTableData])

  // Revalidar cuando alguien dispare cambios globales
  useEffect(() => {
    const onChanged = () => { void mutate() }
    window.addEventListener('accesspoints:changed', onChanged as EventListener)
    return () => window.removeEventListener('accesspoints:changed', onChanged as EventListener)
  }, [mutate])

  return {
    list,
    total,
    error,
    isLoading,

    tableData,
    filterData,
    selectedAccessPoint,
    selectedAccessPoints,

    mutate,
    setTableData,
    setFilterData,
    setSelectedAccessPoint,
    setSelectedAccessPoints,
    setSelectAllAccessPoints,
  }
}
