// src/services/InvitationsService.ts
import ApiService from '@/services/ApiService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'
import { apiGetMyCommunities, apiListCommunities, type Community } from '@/services/CommunitiesService'

export const INVITATIONS_COMMUNITY_BASE = '/api/v1/visits/community'
export const INVITATIONS_ENTRY_BASE = '/api/v1/visits/invitations'

export type InvitationsTableQueries = {
  pageIndex?: number
  pageSize?: number
  skip?: number
  limit?: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: string | number
  [k: string]: unknown
}

export type InvitationRow = {
  id: string | number
  externalPersonId: string | number | ''
  externalPersonName: string
  externalPersonIdNumber: string
  externalPersonContact: string | null
  propertyNumber: string
  propertyId: string | number | ''
  floor?: string | number
  block?: string
  invitedById: string | number | ''
  invitedByName: string
  code: string
  createdAt: string
  expirationAt: string
  used: boolean
  usedAt: string
  resident?: {
    property_id?: string | number
    user_name?: string
    id_number?: string
    property_number?: string
    floor?: string | number
    block?: string
    home_role?: string
  }
  property?: {
    id?: string | number
    number?: string
    floor?: string | number
    block?: string
  }
}

type Dict = Record<string, unknown>

function isObj(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}
function get(o: unknown, k: string): unknown {
  return isObj(o) ? (o as Dict)[k] : undefined
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}
function str(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function strOrNum(v: unknown): string | number | '' {
  if (typeof v === 'number') return v
  const s = str(v)
  return s === '' ? '' : s
}
function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  const s = str(v).trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'si' || s === 'sí'
}

function withPagination(params: Record<string, unknown>) {
  const p: Record<string, unknown> = { ...params }
  const pageIndex = Math.max(1, Number((p.pageIndex as number | undefined) ?? 1))
  const sizeRaw = Number((p.pageSize as number | undefined) ?? 10)
  const pageSize = Number.isFinite(sizeRaw) ? sizeRaw : 10
  const limit = Math.min(100, Math.max(1, pageSize))
  const skip = (pageIndex - 1) * limit
  if (typeof p.skip === 'undefined') p.skip = skip
  if (typeof p.limit === 'undefined') p.limit = limit
  delete p.pageIndex
  delete p.pageSize
  return p
}

function activeCommunityId(fallback?: string | number | null): string | number | '' {
  if (fallback !== undefined && fallback !== null && String(fallback) !== '') return fallback
  const st = useCommunitiesStore.getState()
  const id = st.selectedId
  return id !== undefined && id !== null ? id : ''
}

function communityListUrl(communityId: string | number | '' | null) {
  if (communityId == null || String(communityId) === '') return null
  return `${INVITATIONS_COMMUNITY_BASE}/${encodeURIComponent(String(communityId))}/invitations`
}

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const items = arr(get(raw, 'data'))
  const totalRaw = get(raw, 'total')
  const total = typeof totalRaw === 'number' ? totalRaw : items.length
  return { items, total }
}

function pickId(o: Dict): string | number | '' {
  const keys = ['id', '_id', 'uuid', 'invitation_id', 'invitationId']
  for (const k of keys) {
    const v = o[k]
    if (v !== undefined && v !== null && String(v) !== '') return v as string | number
  }
  return ''
}

function readPropertyNumber(o: Dict): string {
  const direct = str(
    get(o, 'property_number') ??
      get(o, 'propertyNumber') ??
      get(o, 'unit') ??
      get(o, 'apartment') ??
      get(o, 'apt') ??
      get(o, 'houseNumber') ??
      get(o, 'house_number'),
  )
  if (direct) return direct
  const resident = get(o, 'resident')
  if (isObj(resident)) {
    const fromResident = str(
      get(resident, 'property_number') ??
        get(resident, 'propertyNumber') ??
        get(resident, 'property_id') ??
        get(resident, 'propertyId'),
    )
    if (fromResident) return fromResident
  }
  const property = get(o, 'property')
  if (isObj(property)) {
    const nested = str(
      get(property, 'number') ??
        get(property, 'propertyNumber') ??
        get(property, 'code') ??
        get(property, 'name') ??
        get(property, 'id'),
    )
    if (nested) return nested
  }
  return str(get(o, 'property_id') ?? get(o, 'propertyId'))
}

function readInvitedBy(o: Dict): { id: string | number | ''; name: string } {
  const src =
    get(o, 'created_by') ??
    get(o, 'invited_by') ??
    get(o, 'resident') ??
    get(o, 'created_by_user') ??
    get(o, 'createdBy')
  if (isObj(src)) {
    const id = (get(src, 'id') ?? get(src, 'user_id') ?? '') as string | number | ''
    const name =
      str(get(src, 'user_name')) ||
      str(get(src, 'full_name')) ||
      str(get(src, 'name')) ||
      str(get(src, 'email'))
    return { id, name }
  }
  return { id: '', name: str(src) }
}

function toInvitationRow(v: unknown): InvitationRow {
  const o = isObj(v) ? v : {}
  const external = isObj(get(o, 'external_person')) ? (get(o, 'external_person') as Dict) : {}
  const residentObj = isObj(get(o, 'resident')) ? (get(o, 'resident') as Dict) : {}
  const propertyObj = isObj(get(o, 'property')) ? (get(o, 'property') as Dict) : {}
  const invited = readInvitedBy(o)
  const propertyNumber = readPropertyNumber(o)
  const floor =
    strOrNum(get(residentObj, 'floor')) ||
    strOrNum(get(residentObj, 'level')) ||
    strOrNum(get(propertyObj, 'floor')) ||
    strOrNum(get(o, 'floor')) ||
    strOrNum(get(o, 'level'))
  const block =
    str(get(residentObj, 'block')) ||
    str(get(residentObj, 'block_tower')) ||
    str(get(propertyObj, 'block')) ||
    str(get(propertyObj, 'block_tower')) ||
    str(get(o, 'block')) ||
    str(get(o, 'block_tower'))
  const propertyIdRaw =
    (get(o, 'property_id') as string | number | '') ||
    (get(residentObj, 'property_id') as string | number | '') ||
    ((get(propertyObj, 'id') as string | number | '') ?? '')
  return {
    id: pickId(o) || str(get(o, 'id')),
    externalPersonId: (get(external, 'id') ?? '') as string | number | '',
    externalPersonName: str(get(external, 'full_name') ?? get(o, 'external_person_full_name')),
    externalPersonIdNumber: str(get(external, 'id_number') ?? get(o, 'external_person_id_number')),
    externalPersonContact: (get(external, 'contact_info') ?? get(o, 'external_person_contact_info') ?? null) as string | null,
    propertyNumber,
    propertyId: propertyIdRaw,
    floor,
    block,
    invitedById: invited.id,
    invitedByName: invited.name,
    code: str(get(o, 'code')),
    createdAt: str(get(o, 'created_at') ?? get(o, 'createdAt')),
    expirationAt: str(get(o, 'expiration_at') ?? get(o, 'expirationAt')),
    used: bool(get(o, 'used') ?? get(o, 'is_used')),
    usedAt: str(get(o, 'used_at') ?? get(o, 'usedAt')),
    resident: {
      property_id: (get(residentObj, 'property_id') ?? '') as string | number,
      user_name: str(get(residentObj, 'user_name')),
      id_number: str(get(residentObj, 'id_number')),
      property_number: str(get(residentObj, 'property_number')),
      floor,
      block,
      home_role: str(get(residentObj, 'home_role')),
    },
    property: {
      id: (get(propertyObj, 'id') ?? '') as string | number,
      number: str(get(propertyObj, 'number') ?? get(propertyObj, 'propertyNumber')),
      floor,
      block,
    },
  }
}

function applySearch(list: InvitationRow[], q: string): InvitationRow[] {
  const s = q.trim().toLowerCase()
  if (!s) return list
  return list.filter((r) => {
    const pool = [
      r.externalPersonName,
      r.externalPersonIdNumber,
      r.invitedByName,
      r.propertyNumber,
      r.code,
      r.id,
    ]
      .filter((x) => x != null)
      .map((x) => String(x).toLowerCase())
    return pool.some((x) => x.includes(s))
  })
}

function sortList(list: InvitationRow[], key?: string, order: 'asc' | 'desc' = 'desc') {
  const k = (key ?? 'id').toString()
  const factor = order === 'asc' ? 1 : -1
  const val = (r: InvitationRow): string | number => {
    if (k === 'createdAt' || k === 'created_at' || k === 'created') return r.createdAt || ''
    if (k === 'expirationAt' || k === 'expiration_at') return r.expirationAt || ''
    if (k === 'externalPersonName') return r.externalPersonName || ''
    if (k === 'invitedByName') return r.invitedByName || ''
    if (k === 'propertyNumber') return r.propertyNumber || ''
    return typeof r.id === 'number' ? r.id : Number(r.id) || r.id
  }
  return [...list].sort((a, b) => {
    const va = val(a)
    const vb = val(b)
    if (va < vb) return -1 * factor
    if (va > vb) return 1 * factor
    return 0
  })
}

async function fetchCommunityChunk(
  communityId: string | number,
  params: InvitationsTableQueries,
): Promise<{ list: InvitationRow[]; total: number }> {
  const url = communityListUrl(communityId)!
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url,
    method: 'get',
    params: withPagination({ ...params, communityId: undefined }),
  })
  const { items, total } = pickItemsAndTotal(resp)
  return { list: items.map(toInvitationRow), total }
}

async function getAllCommunityIds(): Promise<Array<string | number>> {
  let list: Community[] = []
  try { list = await apiGetMyCommunities<Community[]>() } catch {}
  if (!list.length) {
    try { list = await apiListCommunities<Community[]>({ pageIndex: 1, pageSize: 200 }) } catch {}
  }
  const ids = list.map(c => c.id).filter(id => id !== undefined && id !== null)
  return Array.from(new Set(ids.map(x => String(x)))).map(x => /^\d+$/.test(x) ? Number(x) : x)
}

export async function apiGetInvitationsList<
  T = { list: InvitationRow[]; total: number },
  U extends InvitationsTableQueries = InvitationsTableQueries
>(params: U) {
  const cid = activeCommunityId(params.communityId ?? null)
  if (cid) {
    const { list, total } = await fetchCommunityChunk(cid, params)
    return { list, total } as T
  }
  const ids = await getAllCommunityIds()
  if (!ids.length) return { list: [], total: 0 } as T
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? 10))
  const query = str(params.query ?? '')
  const sortKey = params.sort?.key ? String(params.sort.key) : 'id'
  const sortOrder = (params.sort?.order as 'asc' | 'desc' | undefined) ?? 'desc'
  const innerParams = { ...params, pageIndex: 1, pageSize: 1000 }
  const reqs = ids.map(id =>
    ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
      url: `${INVITATIONS_COMMUNITY_BASE}/${encodeURIComponent(String(id))}/invitations`,
      method: 'get',
      params: withPagination({ ...innerParams, communityId: undefined }),
    }).catch(() => ({ data: [] } as unknown)),
  )
  const settled = await Promise.allSettled(reqs)
  const allRows: InvitationRow[] = []
  let total = 0
  for (const r of settled) {
    if (r.status === 'fulfilled') {
      const { items, total: t } = pickItemsAndTotal(r.value)
      allRows.push(...items.map(toInvitationRow))
      total += typeof t === 'number' ? t : items.length
    }
  }
  const filtered = applySearch(allRows, query)
  const sorted = sortList(filtered, sortKey, sortOrder)
  const start = (pageIndex - 1) * pageSize
  const end = start + pageSize
  const page = sorted.slice(start, end)
  return { list: page, total } as T
}

export async function apiGetInvitation<
  T = unknown,
  U extends { id: string | number } & Record<string, unknown> = { id: string | number }
>({ id, ...params }: U) {
  return ApiService.fetchDataWithAxios<T, Record<string, unknown>>({
    url: `${INVITATIONS_ENTRY_BASE}/${encodeURIComponent(String(id))}`,
    method: 'get',
    params,
  })
}

const InvitationsApi = { apiGetInvitationsList, apiGetInvitation }
export default InvitationsApi
