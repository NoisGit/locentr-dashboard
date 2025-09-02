// src/services/EntryService.ts
import ApiService from '@/services/ApiService'

export const ENTRY_BASE = '/api/v1/visits/invitations'

export type EntryTableQueries = {
  pageIndex?: number
  pageSize?: number
  skip?: number
  limit?: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  [k: string]: unknown
}

function withPagination(params: Record<string, unknown>) {
  const p = { ...params }
  const hasSkip = typeof p.skip !== 'undefined'
  const hasLimit = typeof p.limit !== 'undefined'

  if (!hasSkip || !hasLimit) {
    const pageIndex = Math.max(1, Number((p as any).pageIndex ?? 1))
    const pageSizeRaw = Number((p as any).pageSize ?? 10)
    const pageSize = Number.isFinite(pageSizeRaw) ? pageSizeRaw : 10
    const limit = Math.min(100, Math.max(1, pageSize))
    const skip = (pageIndex - 1) * limit
    p.skip = skip
    p.limit = limit
  }
  delete (p as any).pageIndex
  delete (p as any).pageSize
  return p
}

export async function apiGetEntryList<T = any, U extends EntryTableQueries = EntryTableQueries>(params: U) {
  return ApiService.fetchDataWithAxios<T>({
    url: ENTRY_BASE,
    method: 'get',
    params: withPagination(params as Record<string, unknown>),
  })
}

export async function apiGetEntry<
  T = any,
  U extends { id: string | number } & Record<string, unknown> = { id: string | number }
>({ id, ...params }: U) {
  return ApiService.fetchDataWithAxios<T>({
    url: `${ENTRY_BASE}/${encodeURIComponent(String(id))}`,
    method: 'get',
    params,
  })
}

// (Opcional; solo si existe en tu API)
export async function apiGetEntryLog<T = any, U extends EntryTableQueries = EntryTableQueries>(params: U) {
  return ApiService.fetchDataWithAxios<T>({
    url: `${ENTRY_BASE}/log`,
    method: 'get',
    params: withPagination(params as Record<string, unknown>),
  })
}

const EntryApi = {
  apiGetEntryList,
  apiGetEntry,
  apiGetEntryLog,
}

export default EntryApi
