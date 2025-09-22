// src/services/CondosService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  typeId?: number | ''
  type_id?: number
  adminId?: number | string
  communityIds?: Array<number | string>
  isSuperAdmin?: boolean
}

export type CondoRow = {
  id: number | string
  name: string
  address?: string
  type?: string
  img?: string
  status?: string
}

export type GetCondosListResponse = {
  list: CondoRow[]
  total: number
}

export type CommunityType = { id: number; name: string }

type Dict = Record<string, unknown>

const TYPE_TO_ID: Record<string, number> = {
  edificio: 1,
  building: 1,
  '1': 1,
  condominio: 2,
  condominium: 2,
  '2': 2,
}

const ID_TO_TYPE: Record<number, string> = {
  1: 'Edificio',
  2: 'Condominio',
}

function isRecord(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}

function str(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return ''
}

function toTypeId(input: unknown): number | undefined {
  if (input == null) return undefined
  const raw = isRecord(input) ? (input as Dict).id ?? (input as Dict).name ?? '' : input
  const s = String(raw).trim().toLowerCase()
  return TYPE_TO_ID[s]
}

function toTypeLabel(input: unknown): string {
  if (input == null) return ''
  const n = Number(input as number)
  if (!Number.isNaN(n) && (n === 1 || n === 2)) return ID_TO_TYPE[n as 1 | 2]
  const raw = isRecord(input) ? (input as Dict).name ?? (input as Dict).id ?? '' : input
  const s = String(raw).trim().toLowerCase()
  const id = TYPE_TO_ID[s]
  return id ? ID_TO_TYPE[id] : String(input) || ''
}

function pickArray(raw: unknown): unknown[] {
  const r = isRecord(raw) ? (raw as Dict) : {}
  return (
    (Array.isArray(r.roles) && (r.roles as unknown[])) ||
    (Array.isArray(r.items) && (r.items as unknown[])) ||
    (Array.isArray(r.list) && (r.list as unknown[])) ||
    (Array.isArray(r.communities) && (r.communities as unknown[])) ||
    (Array.isArray(r.types) && (r.types as unknown[])) ||
    (isRecord(r.data) && Array.isArray((r.data as Dict).items) && (((r.data as Dict).items as unknown[]) ?? [])) ||
    (isRecord(r.data) && Array.isArray((r.data as Dict).list) && (((r.data as Dict).list as unknown[]) ?? [])) ||
    (isRecord(r.data) && Array.isArray((r.data as Dict).communities) && (((r.data as Dict).communities as unknown[]) ?? [])) ||
    (isRecord(r.data) && Array.isArray((r.data as Dict).types) && (((r.data as Dict).types as unknown[]) ?? [])) ||
    (Array.isArray(r.data) && ((r.data as unknown[]) ?? [])) ||
    (Array.isArray(r.results) && ((r.results as unknown[]) ?? [])) ||
    (Array.isArray(raw) && (raw as unknown[])) ||
    []
  )
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = isRecord(raw) ? (raw as Dict) : {}
  const items = pickArray(raw)
  const cand =
    r.total ??
    r.count ??
    (isRecord(r.data) ? (r.data as Dict).total : undefined) ??
    (isRecord(r.pagination) ? (r.pagination as Dict).total : undefined)
  const total = Number(typeof cand === 'number' || typeof cand === 'string' ? cand : items.length)
  return { items, total }
}

function adaptCondoRow(u: unknown): CondoRow {
  const r = isRecord(u) ? (u as Dict) : {}
  const rawId = r.id ?? r.community_id ?? r._id
  const cleanId = String(rawId ?? '').replace(/\/+$/, '')
  const first = r.first_name
  const last = r.last_name
  const joined = [str(first), str(last)].filter(Boolean).join(' ').trim()
  const name = str(r.name) || str(r.community_name) || str(r.title) || joined
  const typeIdRaw =
    r.type_id ??
    (isRecord(r.type) ? (r.type as Dict).id : undefined) ??
    r.community_type_id ??
    r.typeId ??
    r.communityTypeId
  const typeRaw =
    (isRecord(r.type) ? (r.type as Dict).name : r.type) ??
    (isRecord(r.community_type) ? (r.community_type as Dict).name : r.community_type) ??
    r.type_name ??
    r.community_type_name ??
    r.kind ??
    r.category ??
    r.property_type
  const displayType = toTypeLabel(typeIdRaw ?? typeRaw)
  const img =
    (r.img as unknown) ??
    (r.avatar as unknown) ??
    (r.avatar_url as unknown) ??
    ''
  return {
    id: cleanId,
    name,
    address: str(r.address) || str(r.street),
    type: displayType,
    img: typeof img === 'string' ? img : '',
    status: str(r.status),
  }
}

function extractCommunityId(u: unknown): string {
  const r = isRecord(u) ? (u as Dict) : {}
  const obj = isRecord(r.community) ? (r.community as Dict) : {}
  const raw =
    r.id ??
    r.community_id ??
    r.communityId ??
    obj.id ??
    obj.community_id ??
    obj.communityId
  const s = String(raw ?? '').trim()
  return s.replace(/\/+$/, '')
}

async function fetchAllowedCommunityIds(headers: Record<string, string>): Promise<string[]> {
  try {
    const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
      url: '/api/v1/communities/access',
      method: 'get',
      headers,
    })
    const items = pickArray(raw)
    const ids = items.map(extractCommunityId).filter((s) => s !== '')
    return ids
  } catch {
    return []
  }
}

export async function apiGetCondosList<
  T = GetCondosListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const p = params as TableQueries
  const pageIndex = Math.max(1, Number(p.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(p.pageSize ?? 10))
  const qp: Record<string, unknown> = { pageIndex, pageSize }
  const q = (p.query == null ? '' : String(p.query)).trim()
  if (q) {
    qp.query = q
    qp.search = q
    qp.q = q
    qp.name = q
    qp['filters[name]'] = q
  }
  const typeId = p.typeId ?? p.type_id
  if (typeId !== '' && typeId != null) qp.type_id = Number(typeId)
  if (p.sort?.key) qp['sort[key]'] = p.sort.key
  if (p.sort?.order) qp['sort[order]'] = p.sort.order
  if (!p.sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }

  const headers: Record<string, string> = {}
  const hasAdmin = p.adminId !== undefined && p.adminId !== null && String(p.adminId) !== ''
  if (hasAdmin) headers['X-Admin-Id'] = String(p.adminId)
  if (Array.isArray(p.communityIds) && p.communityIds.length) {
    headers['X-Community-Ids'] = p.communityIds.map((x) => String(x)).join(',')
  }

  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/communities/',
    method: 'get',
    params: qp,
    headers,
  })

  let { items, total } = pickItemsAndTotal(resp)
  let list: CondoRow[] = items.map(adaptCondoRow)

  if (!p.isSuperAdmin) {
    let allow: Set<string> | null = null
    if (Array.isArray(p.communityIds) && p.communityIds.length) {
      allow = new Set(p.communityIds.map((x) => String(x)))
    } else if (hasAdmin) {
      const ids = await fetchAllowedCommunityIds(headers)
      if (ids.length) allow = new Set(ids)
    }
    if (allow) {
      list = list.filter((r) => allow!.has(String(r.id)))
      total = list.length
    }
  }

  return { list, total } as T
}

function normalizeType(t: unknown): CommunityType {
  const r = isRecord(t) ? (t as Dict) : {}
  const idRaw = r.id ?? r.type_id ?? r.value ?? r.key
  const idNum = Number(idRaw)
  const nameRaw = r.name ?? r.type_name ?? r.label ?? (Number.isFinite(idNum) ? ID_TO_TYPE[idNum as 1 | 2] : undefined)
  const name = String(nameRaw ?? '').trim() || (Number.isFinite(idNum) ? ID_TO_TYPE[idNum as 1 | 2] : '')
  const finalId = Number.isFinite(idNum) ? idNum : (toTypeId(nameRaw) ?? 0)
  return { id: finalId, name }
}

export async function apiGetCommunityTypes(key?: string): Promise<CommunityType[]> {
  const url = typeof key === 'string' && key ? key : '/api/v1/communities/types'
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({ url, method: 'get' })
  return pickArray(resp).map(normalizeType).filter((t): t is CommunityType => Boolean(t.id && t.name))
}

export async function apiCreateCondo(payload: Record<string, unknown>) {
  const body: Record<string, unknown> = { ...payload }
  const tid = toTypeId((payload as Dict).type ?? (payload as Dict).type_id)
  if (tid) body.type_id = tid
  delete body.type
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/communities/',
    method: 'post',
    data: body,
  })
}

export async function apiGetCondoById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return adaptCondoRow(resp)
}

export async function apiUpdateCondo(
  id: string | number,
  patch: Record<string, unknown>
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const body: Record<string, unknown> = { ...patch }
  const tid = toTypeId((patch as Dict).type ?? (patch as Dict).type_id)
  if (tid) body.type_id = tid
  delete body.type
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: body,
  })
}

export async function apiDeleteCondo(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

const CondosApi = {
  apiGetCondosList,
  apiGetCommunityTypes,
  apiCreateCondo,
  apiGetCondoById,
  apiUpdateCondo,
  apiDeleteCondo,
}

export default CondosApi
