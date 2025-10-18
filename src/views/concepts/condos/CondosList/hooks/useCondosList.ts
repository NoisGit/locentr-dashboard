// src/views/concepts/condos/CondosList/hooks/useCondosList.ts
import useSWR from 'swr'
import { apiGetCondosList, type TableQueries as CondoQueries } from '@/services/CondosService'
import { useCondosListStore } from '../store/CondosListStore'
import type { GetCondosListResponse } from '../types'
import { useSessionUser } from '@/store/authStore'

type IdLike = string | number
type Dict = Record<string, unknown>

function getAdminId(u: unknown): IdLike | '' {
  if (!u || typeof u !== 'object') return ''
  const r = u as Dict
  const cand = r.id ?? r._id ?? r.userId ?? r.uid
  return typeof cand === 'string' || typeof cand === 'number' ? (cand as IdLike) : ''
}

function isSuperAdmin(u: unknown): boolean {
  if (!u || typeof u !== 'object') return false
  const r = u as Dict
  const auth = r.authority
  if (!Array.isArray(auth)) return false
  for (const x of auth) {
    const name = typeof x === 'string' ? x : (typeof x === 'object' && x && 'name' in (x as any) ? (x as any).name : '')
    if (String(name).toUpperCase() === 'SUPERADMIN') return true
  }
  return false
}

export default function useCondosList() {
  const authUser = useSessionUser((s) => s.user)
  const adminId = getAdminId(authUser)
  const superAdmin = isSuperAdmin(authUser)

  const {
    tableData,
    filterData,
    selectedCondo,
    selectedCondos,
    setTableData,
    setSelectedCondo,
    setSelectedCondos,
    setSelectAllCondos,
    setFilterData,
  } = useCondosListStore((state) => state)

  const effectiveParams: (CondoQueries & { isSuperAdmin?: boolean }) = {
    ...(tableData as CondoQueries),
    ...(filterData as Partial<CondoQueries>),
    adminId,
    isSuperAdmin: superAdmin,
  }

  const swrKey = ['communities:list', effectiveParams, String(adminId), superAdmin ? 'ALL' : 'MINE'] as const

  const { data, error, isLoading, mutate } = useSWR<GetCondosListResponse>(
    swrKey,
    ([, params]) =>
      apiGetCondosList<GetCondosListResponse, CondoQueries & { isSuperAdmin?: boolean }>(
        params as CondoQueries & { isSuperAdmin?: boolean }
      ),
    { revalidateOnFocus: false }
  )

  const condosList = data?.list || []
  const condosListTotal = data?.total || 0

  return {
    condos: condosList,
    condosList,
    condosTotal: condosListTotal,
    condosListTotal,
    error,
    isLoading,
    tableData,
    filterData,
    selectedCondo,
    selectedCondos,
    mutate,
    setTableData,
    setSelectedCondo,
    setSelectedCondos,
    setSelectAllCondos,
    setFilterData,
  }
}
