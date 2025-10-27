// src/views/concepts/collaborators/CollaboratorsList/hooks/useCollaboratorsList.ts
import useSWR from 'swr'
import { useMemo, useEffect } from 'react'
import { useCommunitiesStore, isVirtualCommunityId } from '@/store/communities/CommunitiesStore'
import { useAuth } from '@/auth'
import { RBAC } from '@/utils/rbac/rbacCore'
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
  viewerRole?: string,
) {
  const p = params as Rec
  return [
    p.pageIndex ?? 1,
    p.pageSize ?? 10,
    p.query ?? '',
    (isRec(p.sort) ? (p.sort as Rec).key : '') ?? '',
    (isRec(p.sort) ? (p.sort as Rec).order : '') ?? '',
    communityId ?? '',
    viewerRole ?? '',
  ].join('|')
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

  // Rol del viewer (controla visibilidad de SUPERADMIN)
  const { user } = useAuth()
  const viewerRole = RBAC.extractUserRole(user) as 'SUPERADMIN' | 'ADMIN' | 'SUBADMIN' | undefined

  // Params efectivos que viajan al service (memo para estabilidad)
  const effectiveParams = useMemo<CollaboratorTableQueries>(() => {
    return {
      pageIndex : (tableData.pageIndex as number) ?? 1,
      pageSize  : (tableData.pageSize as number) ?? 10,
      query     : (tableData.query as string) ?? '',
      sort      : tableData.sort as CollaboratorTableQueries['sort'],
      communityId: communityId ?? '', // '' => sin filtro
      viewerRole,
    }
    // OJO: dependencias solo cuando realmente cambian
  }, [tableData.pageIndex, tableData.pageSize, tableData.query, tableData.sort, communityId, viewerRole])

  // Clave estable SOLO con primitivos (evita múltiples requests por cambios de referencia)
  const keySig = buildKeySig(effectiveParams as unknown as Rec, communityId ?? '', viewerRole)
  const swrKey = ['collaborators:list', keySig] as const

  // SWR: sin sobre-revalidación; mantener datos previos entre páginas
  const { data, error, isLoading, mutate } = useSWR<GetCollaboratorsListResponse>(
    swrKey,
    () => apiGetCollaboratorsList(effectiveParams),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 800,
    },
  )

  const list  = data?.list ?? []
  const total = typeof data?.total === 'number' ? data.total : list.length

  /* ---------- efectos de UX ---------- */

  // 1) Si cambia la comunidad, volvemos a página 1 y limpiamos selección
  useEffect(() => {
    setTableData((prev) => ({ ...prev, pageIndex: 1 }))
    setSelectAllCollaborators([])
    setSelectedCollaborators([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId])

  // 2) Si quedamos en una página vacía, saltamos a la última válida
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

    mutate, // para refresh manual cuando TÚ lo decidas (no automático)
    setTableData,
    setFilterData,
    setSelectedCollaborator,
    setSelectedCollaborators,
    setSelectAllCollaborators,
  }
}
