// src/services/PropertiesService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: number | string | ''
}

export type PropertyRow = {
  id: number | string
  communityId?: number | string
  communityName?: string
  propertyNumber?: string
  floor?: number
  tower?: string
  block?: string
  status?: string
  img?: string
}

export type GetPropertiesListResponse = {
  list: PropertyRow[]
  total: number
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function get(obj: unknown, key: string): unknown {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key)
    ? (obj as Record<string, unknown>)[key]
    : undefined
}
function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}
function toStr(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return undefined
}
function toNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(v as unknown)
  return Number.isFinite(n) ? n : undefined
}
function trimSlashes(s: string): string {
  return s.replace(/\/+$/, '')
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const candidates = [
    get(raw, 'items'),
    get(get(raw, 'data'), 'items'),
    get(raw, 'list'),
    get(get(raw, 'data'), 'list'),
    get(raw, 'results'),
    get(get(raw, 'data'), 'results'),
    get(raw, 'properties'),
    get(get(raw, 'data'), 'properties'),
    get(raw, 'data'),
    raw,
  ]
  let items: unknown[] = []
  for (const c of candidates) {
    const arr = asArray(c)
    if (arr.length) {
      items = arr
      break
    }
  }
  const totalRaw =
    get(raw, 'total') ??
    get(raw, 'count') ??
    get(get(raw, 'pagination'), 'total') ??
    get(get(raw, 'data'), 'total') ??
    items.length
  return { items, total: Number(totalRaw ?? items.length) }
}

function mapRow(p: unknown): PropertyRow {
  const o = isObject(p) ? p : {}

  const idRaw =
    get(o, 'id') ??
    get(o, 'property_id') ??
    get(o, 'propertyId') ??
    get(o, '_id') ??
    ''
  const idStr = toStr(idRaw) ?? ''
  const id = idStr !== '' ? trimSlashes(idStr) : String(idRaw ?? '')

  const community = isObject(get(o, 'community')) ? (get(o, 'community') as Record<string, unknown>) : undefined
  const communityId = get(o, 'community_id') ?? (community ? get(community, 'id') : undefined)
  const communityName = get(o, 'community_name') ?? (community ? get(community, 'name') : undefined)

  const propertyNumber =
    get(o, 'property_number') ??
    get(o, 'number') ??
    get(o, 'unit') ??
    get(o, 'code')

  const floorNum = toNum(get(o, 'floor'))

  // ⇩ aquí soportamos todas las variantes que puede devolver el backend
  const towerVal =
    toStr(get(o, 'tower')) ??
    toStr(get(o, 'block')) ??
    toStr(get(o, 'block_tower')) ??
    toStr(get(o, 'building'))

  const status = toStr(get(o, 'status')) ?? ''
  const img = toStr(get(o, 'img') ?? get(o, 'avatar') ?? get(o, 'avatar_url')) ?? ''

  return {
    id,
    communityId: toStr(communityId) ?? undefined,
    communityName: toStr(communityName),
    propertyNumber: toStr(propertyNumber),
    floor: floorNum,
    tower: towerVal,
    block: towerVal, // alias por compatibilidad con la tabla
    status,
    img,
  }
}

export async function apiGetPropertiesList<
  T = GetPropertiesListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as TableQueries).pageIndex ?? 1))
  const pageSize = Math.max(1, Number((params as TableQueries).pageSize ?? 10))

  const qp: Record<string, unknown> = { pageIndex, pageSize }
  const q = (params as TableQueries).query
  if (q != null) qp.query = q
  const s = (params as TableQueries).sort
  if (s?.key) qp['sort[key]'] = s.key
  if (s?.order) qp['sort[order]'] = s.order

  const cid = (params as TableQueries).communityId
  const endpoint =
    cid !== '' && cid != null
      ? `/api/v1/communities/${encodeURIComponent(String(cid))}/properties`
      : '/api/v1/communities/properties'

  const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: endpoint,
    method: 'get',
    params: qp,
  })

  const { items, total } = pickItemsAndTotal(body)
  const list: PropertyRow[] = items.map(mapRow)
  return { list, total } as T
}

export async function apiCreateProperty(payload: {
  community_id?: number | string
  property_number: string
  floor: number | string
  block?: string
}) {
  const data: Record<string, unknown> = {
    property_number: String(payload.property_number ?? '').trim(),
    floor: Number(payload.floor),
  }
  if (payload.community_id !== undefined && payload.community_id !== '') {
    data.community_id = Number(payload.community_id)
  }
  const block = (payload.block ?? '').toString().trim()
  if (block) {
    data.block = block
    data.block_tower = block
    data.tower = block
  }

  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/communities/properties',
    method: 'post',
    data,
  })
}

export async function apiGetPropertyById(id: string | number) {
  const cleanId = trimSlashes(String(id))
  const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return mapRow(body)
}

export async function apiUpdateProperty(
  id: string | number,
  patch: Partial<{ community_id: number | string; property_number: string; floor: number | string; block: string }>
) {
  const cleanId = trimSlashes(String(id))
  const data: Record<string, unknown> = {}
  if (patch.community_id !== undefined && patch.community_id !== '') data.community_id = Number(patch.community_id)
  if (patch.property_number !== undefined) data.property_number = String(patch.property_number ?? '').trim()
  if (patch.floor !== undefined) data.floor = Number(patch.floor)
  if (patch.block !== undefined) {
    const block = String(patch.block ?? '').trim()
    data.block = block
    data.block_tower = block
    data.tower = block
  }

  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data,
  })
}

export async function apiDeleteProperty(id: string | number) {
  const cleanId = trimSlashes(String(id))
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/properties/id/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

const PropertiesApi = {
  apiGetPropertiesList,
  apiCreateProperty,
  apiGetPropertyById,
  apiUpdateProperty,
  apiDeleteProperty,
}

export default PropertiesApi
