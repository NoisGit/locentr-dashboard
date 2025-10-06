// src/services/LogbookService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

type Dict = Record<string, unknown>

export type LogbookRow = {
  id: number | string
  description: string
  createdAt?: string
  updatedAt?: string
  created_by?: string
  created_by_user_id?: number | string | null
  community_id?: number | string | null
  property_id?: number | string | null
  category?: string
}

export type GetLogbookListResponse = {
  list: LogbookRow[]
  total: number
}

export type LogbookDetail = {
  id: string | number
  description: string
  created_by?: string
  created_by_user_id?: number | string | null
  updated_at?: string
  community_id?: number | string | null
  property_id?: number | string | null
  category?: string
}

/* ---------------------------------- utils --------------------------------- */
function isRec(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}
function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function toId(v: unknown): number | string | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') return v
  return undefined
}
function getObj(o: Dict | null | undefined, key: string): Dict | null {
  const v = o?.[key]
  return isRec(v) ? (v as Dict) : null
}
function getArr(o: Dict | null | undefined, key: string): unknown[] | null {
  const v = o?.[key]
  return Array.isArray(v) ? (v as unknown[]) : null
}

function pickArray(raw: unknown): unknown[] {
  const r = isRec(raw) ? (raw as Dict) : {}
  const direct = getArr(r, 'items') || getArr(r, 'list') || getArr(r, 'results')
  if (direct) return direct
  const dataObj = getObj(r, 'data')
  const nested = getArr(dataObj, 'items') || getArr(dataObj, 'list') || getArr(dataObj, 'results')
  if (nested) return nested
  const dataArr = Array.isArray(r['data']) ? (r['data'] as unknown[]) : null
  if (dataArr) return dataArr
  if (Array.isArray(raw)) return raw as unknown[]
  return []
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = isRec(raw) ? (raw as Dict) : {}
  const items = pickArray(raw)
  const cand =
    r['total'] ??
    r['count'] ??
    getObj(r, 'data')?.['total'] ??
    getObj(r, 'pagination')?.['total'] ??
    items.length
  let total = 0
  if (typeof cand === 'number') total = cand
  else if (typeof cand === 'string') {
    const n = Number(cand)
    total = Number.isNaN(n) ? items.length : n
  } else if (typeof cand === 'boolean') {
    total = cand ? items.length : 0
  } else {
    total = items.length
  }
  return { items, total }
}

function buildQueryParams(p: TableQueries): Record<string, unknown> {
  const pageIndex = Math.max(1, Number(p.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(p.pageSize ?? 10))
  const qp: Record<string, unknown> = { pageIndex, pageSize }
  const q = (p.query == null ? '' : String(p.query)).trim()
  if (q) {
    qp.query = q
    qp.search = q
    qp.q = q
    qp.text = q
    qp.description = q
  }
  if (p.sort?.key) qp['sort[key]'] = p.sort.key
  if (p.sort?.order) qp['sort[order]'] = p.sort.order
  if (!p.sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }
  return qp
}

/* ------------------------------ map functions ----------------------------- */
function mapEntry(u: unknown): LogbookRow {
  const r = isRec(u) ? (u as Dict) : {}
  const idStr = toStr(r['id'] ?? r['entry_id'] ?? r['_id'])

  const description =
    toStr(r['description']) ||
    toStr(r['content']) ||
    toStr(r['note']) ||
    toStr(r['text']) ||
    toStr(r['message']) ||
    toStr(r['details'])

  const createdAt = toStr(r['createdAt'] ?? r['created_at'] ?? r['created'])
  const updatedAt = toStr(r['updatedAt'] ?? r['updated_at'] ?? r['updated'] ?? r['updateTime'])
  const created_by =
    toStr(r['created_by'] ?? r['author'] ?? r['author_name'] ?? r['createdBy'] ?? r['user_name'])

  const created_by_user_id =
    toId(r['created_by_user_id']) ??
    toId(r['author_id']) ??
    toId(r['user_id']) ??
    toId(getObj(r, 'created_by')?.['id']) ??
    null

  const community_id =
    toId(r['community_id']) ?? toId(getObj(r, 'community')?.['id']) ?? null

  const property_id =
    toId(r['property_id']) ?? toId(getObj(r, 'property')?.['id']) ?? null

  const category = toStr(r['category'] ?? r['type'])

  return {
    id: idStr || String(r['id'] ?? ''),
    description,
    createdAt,
    updatedAt,
    created_by,
    created_by_user_id: created_by_user_id ?? null,
    community_id: community_id ?? null,
    property_id: property_id ?? null,
    category,
  }
}

function pickDetailObject(raw: unknown): Dict {
  if (isRec(raw)) {
    const r = raw as Dict
    const dataObj = getObj(r, 'data')
    if (dataObj) return dataObj
    const resultObj = getObj(r, 'result')
    if (resultObj) return resultObj
    const entryObj = getObj(r, 'entry') || getObj(r, 'logbook') || getObj(r, 'record')
    if (entryObj) return entryObj
    return r
  }
  return {}
}

function mapDetail(r: Dict, idFallback: string | number): LogbookDetail {
  const createdByObj = getObj(r, 'created_by')
  const created_by_user_id =
    toId(r['created_by_user_id']) ??
    toId(r['created_by_id']) ??
    toId(r['author_id']) ??
    toId(createdByObj?.['id']) ??
    null

  return {
    id: toStr(r['id'] ?? idFallback) || String(idFallback),
    description:
      toStr(r['description'] ?? r['content'] ?? r['note'] ?? r['text'] ?? r['message'] ?? ''),
    created_by: toStr(r['created_by'] ?? r['author'] ?? r['author_name'] ?? r['createdBy']),
    created_by_user_id,
    updated_at: toStr(r['updated_at'] ?? r['updatedAt'] ?? r['updated']),
    community_id: toId(r['community_id']) ?? toId(getObj(r, 'community')?.['id']) ?? null,
    property_id: toId(r['property_id']) ?? toId(getObj(r, 'property')?.['id']) ?? null,
    category: toStr(r['category'] ?? r['type']),
  }
}

/* ---------------------------------- list ---------------------------------- */
export async function apiGetCommunityLogbookEntries<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(communityId: string | number, params: Q): Promise<T> {
  const qp = buildQueryParams(params as TableQueries)
  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/community-logbook/communities/${encodeURIComponent(String(communityId))}/entries`,
    method: 'get',
    params: qp,
  })
  const { items, total } = pickItemsAndTotal(raw)
  const list: LogbookRow[] = items.map(mapEntry)
  return { list, total } as T
}

export async function apiGetPropertyLogbookEntries<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(propertyId: string | number, params: Q): Promise<T> {
  const qp = buildQueryParams(params as TableQueries)
  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/community-logbook/properties/${encodeURIComponent(String(propertyId))}/entries`,
    method: 'get',
    params: qp,
  })
  const { items, total } = pickItemsAndTotal(raw)
  const list: LogbookRow[] = items.map(mapEntry)
  return { list, total } as T
}

export async function apiGetAllLogbookEntries<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const qp = buildQueryParams(params as TableQueries)
  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/community-logbook/entries`,
    method: 'get',
    params: qp,
  })
  const { items, total } = pickItemsAndTotal(raw)
  const list: LogbookRow[] = items.map(mapEntry)
  return { list, total } as T
}

/* ---- ALIAS para compatibilidad con el hook estilo News (¡IMPORTANTE!) ---- */
// Superadmin (sin comunidad seleccionada): usa el endpoint global
export async function apiGetAllLogbookAggregated<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  return apiGetAllLogbookEntries<T, Q>(params)
}

// Comunidad específica (mismo shape que News)
export async function apiGetCommunityLogbook<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(communityId: string | number, params: Q): Promise<T> {
  return apiGetCommunityLogbookEntries<T, Q>(communityId, params)
}

// Por propiedad (opcional, por si lo usas en otras vistas)
export async function apiGetPropertyLogbook<
  T = GetLogbookListResponse,
  Q extends TableQueries = TableQueries
>(propertyId: string | number, params: Q): Promise<T> {
  return apiGetPropertyLogbookEntries<T, Q>(propertyId, params)
}

/* --------------------------------- detail --------------------------------- */
export async function apiGetLogbookById<T = LogbookDetail>(id: string | number): Promise<T> {
  const raw = await ApiService.fetchDataWithAxios<unknown>({
    url: `/api/v1/community-logbook/entries/${encodeURIComponent(String(id))}`,
    method: 'get',
  })
  return mapDetail(pickDetailObject(raw), id) as T
}

/* --------------------------- create / update / del ------------------------- */
export type CreateLogbookPayload = Partial<{
  description: string
  content: string
  note: string
  text: string
  message: string
  category: string
  community_id: number | string
  property_id: number | string
  created_by_user_id: number | string
}>

export async function apiCreateLogbookEntry(payload: CreateLogbookPayload) {
  const data: Dict = {}

  const desc =
    (payload.description ?? payload.content ?? payload.note ?? payload.text ?? payload.message ?? '').toString().trim()

  if (desc) data.description = desc
  if (payload.category !== undefined) data.category = String(payload.category ?? '').trim()
  if (payload.community_id !== undefined) data.community_id = payload.community_id
  if (payload.property_id !== undefined) data.property_id = payload.property_id
  if (payload.created_by_user_id !== undefined) data.created_by_user_id = payload.created_by_user_id

  return ApiService.fetchDataWithAxios({
    url: `/api/v1/community-logbook/entries`,
    method: 'post',
    data,
  })
}

export type UpdateLogbookPatch = Partial<{
  description: string
  content: string
  note: string
  text: string
  message: string
  category: string
  community_id: number | string
  property_id: number | string
  created_by_user_id: number | string
}>

export async function apiUpdateLogbookEntry(id: string | number, patch: UpdateLogbookPatch) {
  const data: Dict = {}
  if (patch.description !== undefined || patch.content !== undefined || patch.note !== undefined || patch.text !== undefined || patch.message !== undefined) {
    const desc =
      (patch.description ?? patch.content ?? patch.note ?? patch.text ?? patch.message ?? '').toString().trim()
    data.description = desc
  }
  if (patch.category !== undefined) data.category = String(patch.category ?? '').trim()
  if (patch.community_id !== undefined) data.community_id = patch.community_id
  if (patch.property_id !== undefined) data.property_id = patch.property_id
  if (patch.created_by_user_id !== undefined) data.created_by_user_id = patch.created_by_user_id

  return ApiService.fetchDataWithAxios({
    url: `/api/v1/community-logbook/entries/${encodeURIComponent(String(id))}`,
    method: 'put',
    data,
  })
}

export async function apiDeleteLogbookEntry(id: string | number) {
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/community-logbook/entries/${encodeURIComponent(String(id))}`,
    method: 'delete',
  })
}

/* --------------------------------- export --------------------------------- */
const LogbookApi = {
  apiGetCommunityLogbookEntries,
  apiGetPropertyLogbookEntries,
  apiGetAllLogbookEntries,
  apiGetAllLogbookAggregated,   // alias para superadmin
  apiGetCommunityLogbook,       // alias para comunidad
  apiGetPropertyLogbook,        // alias para propiedad
  apiGetLogbookById,
  apiCreateLogbookEntry,
  apiUpdateLogbookEntry,
  apiDeleteLogbookEntry,
}

export default LogbookApi
