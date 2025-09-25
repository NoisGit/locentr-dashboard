// src/services/InvitationsService.ts
import ApiService from '@/services/ApiService'
import { useCommunitiesStore } from '@/store/communities/CommunitiesStore'

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
function toString(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function toStrOrNum(v: unknown): string | number | '' {
  if (typeof v === 'number') return v
  const s = toString(v)
  return s === '' ? '' : s
}
function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    return s === 'true' || s === '1' || s === 'yes' || s === 'si' || s === 'sí'
  }
  return false
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
  if (fallback !== undefined && fallback !== null && String(fallback) !== '') {
    return fallback
  }
  const st = useCommunitiesStore.getState()
  const id = st.selectedId
  return id !== undefined && id !== null ? id : ''
}
function buildCommunityInvitationsUrl(communityId: string | number | '' | null) {
  if (communityId == null || String(communityId) === '') return null
  return `${INVITATIONS_COMMUNITY_BASE}/${encodeURIComponent(String(communityId))}/invitations`
}

/** Solo valida por `data` (items) y `total` */
function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const items = asArray(get(raw, 'data'))
  const totalRaw = get(raw, 'total')
  const total = typeof totalRaw === 'number' ? totalRaw : items.length
  return { items, total }
}

function pickIdFlat(o: Record<string, unknown>): string | number | '' {
  const keys = ['id', '_id', 'uuid', 'invitation_id', 'invitationId']
  for (const k of keys) {
    const v = o[k]
    if (v !== undefined && v !== null && String(v) !== '') return v as string | number
  }
  return ''
}
function readPropertyNumber(o: Record<string, unknown>): string {
  const direct = toString(
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
  if (isObject(resident)) {
    const fromResident = toString(
      get(resident, 'property_number') ??
        get(resident, 'propertyNumber') ??
        get(resident, 'property_id') ??
        get(resident, 'propertyId'),
    )
    if (fromResident) return fromResident
  }
  const prop = get(o, 'property')
  if (isObject(prop)) {
    const nested = toString(
      get(prop, 'number') ?? get(prop, 'propertyNumber') ?? get(prop, 'code') ?? get(prop, 'name') ?? get(prop, 'id'),
    )
    if (nested) return nested
  }
  const byId = toString(get(o, 'property_id') ?? get(o, 'propertyId'))
  return byId
}
function readInvitedBy(o: Record<string, unknown>): { id: string | number | ''; name: string } {
  const src =
    get(o, 'created_by') ?? get(o, 'invited_by') ?? get(o, 'resident') ?? get(o, 'created_by_user') ?? get(o, 'createdBy')
  if (isObject(src)) {
    const id = (get(src, 'id') ?? get(src, 'user_id') ?? '') as string | number | ''
    const name =
      toString(get(src, 'user_name')) ||
      toString(get(src, 'full_name')) ||
      toString(get(src, 'name')) ||
      toString(get(src, 'email'))
    return { id, name }
  }
  const s = toString(src)
  return { id: '', name: s }
}

function toInvitationRow(v: unknown): InvitationRow {
  const o = isObject(v) ? v : {}
  const external = isObject(get(o, 'external_person')) ? (get(o, 'external_person') as Record<string, unknown>) : {}
  const residentObj = isObject(get(o, 'resident')) ? (get(o, 'resident') as Record<string, unknown>) : {}
  const propertyObj = isObject(get(o, 'property')) ? (get(o, 'property') as Record<string, unknown>) : {}
  const invited = readInvitedBy(o)

  const propertyNumber = readPropertyNumber(o)

  const floor =
    toStrOrNum(get(residentObj, 'floor')) ||
    toStrOrNum(get(residentObj, 'level')) ||
    toStrOrNum(get(propertyObj, 'floor')) ||
    toStrOrNum(get(o, 'floor')) ||
    toStrOrNum(get(o, 'level'))

  const block =
    toString(get(residentObj, 'block')) ||
    toString(get(residentObj, 'block_tower')) ||
    toString(get(propertyObj, 'block')) ||
    toString(get(propertyObj, 'block_tower')) ||
    toString(get(o, 'block')) ||
    toString(get(o, 'block_tower'))

  const propertyIdRaw =
    (get(o, 'property_id') as string | number | '') ||
    (get(residentObj, 'property_id') as string | number | '') ||
    ((get(propertyObj, 'id') as string | number | '') ?? '')

  return {
    id: pickIdFlat(o) || toString(get(o, 'id')),
    externalPersonId: (get(external, 'id') ?? '') as string | number | '',
    externalPersonName: toString(get(external, 'full_name') ?? get(o, 'external_person_full_name')),
    externalPersonIdNumber: toString(get(external, 'id_number') ?? get(o, 'external_person_id_number')),
    externalPersonContact: (get(external, 'contact_info') ?? get(o, 'external_person_contact_info') ?? null) as string | null,
    propertyNumber,
    propertyId: propertyIdRaw,
    floor,
    block,
    invitedById: invited.id,
    invitedByName: invited.name,
    code: toString(get(o, 'code')),
    createdAt: toString(get(o, 'created_at') ?? get(o, 'createdAt')),
    expirationAt: toString(get(o, 'expiration_at') ?? get(o, 'expirationAt')),
    used: toBoolean(get(o, 'used') ?? get(o, 'is_used')),
    usedAt: toString(get(o, 'used_at') ?? get(o, 'usedAt')),
    resident: {
      property_id: (get(residentObj, 'property_id') ?? '') as string | number,
      user_name: toString(get(residentObj, 'user_name')),
      id_number: toString(get(residentObj, 'id_number')),
      property_number: toString(get(residentObj, 'property_number')),
      floor,
      block,
      home_role: toString(get(residentObj, 'home_role')),
    },
    property: {
      id: (get(propertyObj, 'id') ?? '') as string | number,
      number: toString(get(propertyObj, 'number') ?? get(propertyObj, 'propertyNumber')),
      floor,
      block,
    },
  }
}

export async function apiGetInvitationsList<
  T = { list: InvitationRow[]; total: number },
  U extends InvitationsTableQueries = InvitationsTableQueries
>(params: U) {
  const cid = activeCommunityId(params.communityId ?? null)
  const url = buildCommunityInvitationsUrl(cid)
  if (!url) return { list: [], total: 0 } as T

  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url,
    method: 'get',
    params: withPagination({ ...params, communityId: undefined }),
  })

  const { items, total } = pickItemsAndTotal(resp)
  const list = items.map(toInvitationRow)
  return { list, total } as T
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
