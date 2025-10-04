// src/services/CommunitiesService.ts
import ApiService from '@/services/ApiService'

export const COMMUNITIES_BASE = '/api/v1/communities/'
export const COMMUNITY_ACCESS_BASE = '/api/v1/communities/access'

export type Community = {
  id: string | number
  name: string
  code?: string
  slug?: string
  imageUrl?: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}
function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function get(obj: unknown, key: string): unknown {
  return isRecord(obj) ? (obj as Record<string, unknown>)[key] : undefined
}
function pickId(o: Record<string, unknown>): string | number | '' {
  const keys = ['id', '_id', 'uuid', 'community_id', 'communityId', 'id_community', 'idCommunity']
  for (const k of keys) {
    const v = o[k]
    if (v !== undefined && v !== null && String(v) !== '') return v as string | number
  }
  return ''
}
function pickName(o: Record<string, unknown>): string {
  return (
    toStr(o.name) ||
    toStr(o.community_name) ||
    toStr(o.full_name) ||
    toStr(get(o, 'title')) ||
    toStr(get(o, 'label')) ||
    toStr(get(o, 'slug')) ||
    toStr(get(o, 'code'))
  )
}
function mapToCommunity(v: unknown): Community | null {
  const o = isRecord(v) ? v : {}
  const id = pickId(o)
  const name = pickName(o)
  if (!id || !name) return null
  return {
    id,
    name,
    code: toStr(get(o, 'code')),
    slug: toStr(get(o, 'slug')),
    imageUrl: toStr(get(o, 'imageUrl')) || toStr(get(o, 'image_url')) || toStr(get(o, 'logo')),
  }
}

function firstArrayCandidate(obj: unknown): unknown[] {
  if (Array.isArray(obj)) return obj
  if (!isRecord(obj)) return []
  const preferKeys = ['communities', 'entries', 'items', 'list', 'results', 'records', 'rows', 'content', 'data']
  for (const k of preferKeys) {
    const v = (obj as Record<string, unknown>)[k]
    if (Array.isArray(v) && v.length) return v
  }
  const d = get(obj, 'data')
  if (isRecord(d)) {
    for (const k of preferKeys) {
      const v = (d as Record<string, unknown>)[k]
      if (Array.isArray(v) && v.length) return v
    }
  }
  return []
}
function deepFindFirstArray(input: unknown, depth = 0): unknown[] {
  if (Array.isArray(input)) return input
  if (!isRecord(input) || depth > 4) return []
  const direct = firstArrayCandidate(input)
  if (direct.length) return direct
  for (const v of Object.values(input)) {
    const found = deepFindFirstArray(v, depth + 1)
    if (found.length) return found
  }
  return []
}

export async function apiGetMyCommunities<T = Community[]>() {
  const resp = await ApiService.fetchDataWithAxios<unknown>({
    url: COMMUNITY_ACCESS_BASE,
    method: 'get',
  })
  const rawList = deepFindFirstArray(resp)
  const list = rawList.map(mapToCommunity).filter((x): x is Community => x !== null)
  return list as T
}

export async function apiListCommunities<T = Community[]>(
  params: { pageIndex?: number; pageSize?: number; sort?: { key?: string; order?: 'asc' | 'desc' } } = {},
) {
  const { pageIndex = 1, pageSize = 200, sort = { key: 'id', order: 'desc' } } = params
  const resp = await ApiService.fetchDataWithAxios<unknown>({
    url: COMMUNITIES_BASE,
    method: 'get',
    params: {
      pageIndex,
      pageSize,
      'sort[key]': sort.key,
      'sort[order]': sort.order,
    },
  })
  const rawList = deepFindFirstArray(resp)
  const list = rawList.map(mapToCommunity).filter((x): x is Community => x !== null)
  return list as T
}

export async function apiGetCommunityById<T = Community>(id: string | number) {
  const resp = await ApiService.fetchDataWithAxios<unknown>({
    url: `${COMMUNITIES_BASE}id/${encodeURIComponent(String(id))}`,
    method: 'get',
  })
  const arr = deepFindFirstArray(resp)
  const first = (arr[0] ?? resp) as unknown
  const mapped = mapToCommunity(first)
  return (mapped ?? ({ id, name: '' } as Community)) as T
}

const CommunityApi = { apiGetMyCommunities, apiListCommunities, apiGetCommunityById }
export default CommunityApi
