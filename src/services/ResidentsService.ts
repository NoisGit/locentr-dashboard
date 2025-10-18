// src/services/ResidentsService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  propertyId?: number | ''
  userId?: number | ''
  isOwner?: boolean | ''
  startDateFrom?: string
  endDateTo?: string
  communityId?: number | string | ''
}

export type ResidentRow = {
  id: number | string
  userId: number | string
  propertyId: number | string
  userName?: string
  propertyName?: string
  propertyNumber?: string
  floor?: number | string
  block?: string
  homeRole?: string
  isOwner?: boolean
  startDate?: string
  endDate?: string
  img?: string
  status?: string
  idNumber?: string
  userEmail?: string
  communityName?: string
}

export type GetResidentsListResponse = {
  list: ResidentRow[]
  total: number
}

type Dict = Record<string, unknown>

function isRecord(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}
function str(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}
function toYMD(input: unknown): string | undefined {
  if (input === '' || input == null) return undefined
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) return input.trim()
  const d = input instanceof Date ? input : new Date(input as string | number | Date)
  if (Number.isNaN(d.getTime())) return undefined
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function boolOrUndef(v: unknown): boolean | undefined {
  if (v === '' || v == null) return undefined
  if (typeof v === 'boolean') return v
  const s = String(v).toLowerCase().trim()
  if (s === 'true' || s === '1') return true
  if (s === 'false' || s === '0') return false
  return undefined
}
function pickItemsAndTotalDetailed(raw: unknown): { items: unknown[]; total: number } {
  if (isRecord(raw) && Array.isArray(raw.data as unknown[])) {
    const items = raw.data as unknown[]
    const total = Number((raw.total as unknown) ?? items.length)
    return { items, total }
  }
  const items = Array.isArray(raw) ? (raw as unknown[]) : []
  return { items, total: items.length }
}

function adaptResidentDetailed(u: unknown): ResidentRow {
  const r: Dict = isRecord(u) ? u : {}
  const id = String(r.id ?? '')
  const userId = String(r.user_id ?? '')
  const propertyId = String(r.property_id ?? '')
  const userName = str(r.user_name)
  const propertyNumber = str(r.property_number)

  const floorRaw = r.floor
  const floor: number | string | undefined =
    typeof floorRaw === 'number'
      ? floorRaw
      : typeof floorRaw === 'string' && floorRaw.trim() !== ''
      ? floorRaw
      : undefined

  const block = str(r.block)
  const homeRole = str(r.home_role)
  const isOwner = Boolean(r.is_owner)
  const startDate = toYMD(r.start_date)
  const endDate = toYMD(r.end_date)
  const idNumber = str(r.id_number)
  const userEmail = str(r.user_email)
  const communityName = str(r.community_name)

  return {
    id,
    userId,
    propertyId,
    userName,
    propertyNumber,
    floor,
    block,
    homeRole,
    isOwner,
    startDate,
    endDate,
    idNumber,
    userEmail,
    communityName,
  }
}

export async function apiGetResidentsList<
  T = GetResidentsListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? 10))
  const skip = (pageIndex - 1) * pageSize

  const qp: Record<string, unknown> = {
    pageIndex,
    pageSize,
    limit: pageSize,
    skip,
  }

  const q = (params.query ?? '').toString().trim()
  if (q) qp.query = q
  if (params.propertyId !== '' && params.propertyId != null) qp.property_id = Number(params.propertyId)
  if (params.userId !== '' && params.userId != null) qp.user_id = Number(params.userId)
  const isOwner = boolOrUndef(params.isOwner)
  if (typeof isOwner === 'boolean') qp.is_owner = isOwner
  const startFrom = toYMD(params.startDateFrom)
  if (startFrom) qp.start_date_from = startFrom
  const endTo = toYMD(params.endDateTo)
  if (endTo) qp.end_date_to = endTo
  if (params.communityId !== '' && params.communityId != null) qp.community_id = Number(params.communityId)
  if (params.sort?.key) qp['sort[key]'] = params.sort.key
  if (params.sort?.order) qp['sort[order]'] = params.sort.order
  if (!params.sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }

  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/residents/detailed',
    method: 'get',
    params: qp,
  })

  const { items, total } = pickItemsAndTotalDetailed(resp)
  const list: ResidentRow[] = items.map(adaptResidentDetailed)
  return { list, total } as T
}

export async function apiCreateResident(payload: {
  user_id: number | string
  property_id: number | string
  is_owner?: boolean
  start_date?: string | Date
  end_date?: string | Date
}) {
  const body: Record<string, unknown> = {
    user_id: Number(payload.user_id),
    property_id: Number(payload.property_id),
    start_date: toYMD(payload.start_date) ?? null,
    end_date: toYMD(payload.end_date) ?? null,
  }
  if (typeof payload.is_owner === 'boolean') body.is_owner = payload.is_owner
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/residents/',
    method: 'post',
    data: body,
  })
}

export async function apiGetResidentById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/residents/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return adaptResidentDetailed(resp)
}

export async function apiUpdateResident(
  id: string | number,
  patch: {
    user_id?: number | string
    property_id?: number | string
    is_owner?: boolean
    start_date?: string | Date
    end_date?: string | Date
  },
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const body: Record<string, unknown> = {}
  if (patch.user_id != null) body.user_id = Number(patch.user_id)
  if (patch.property_id != null) body.property_id = Number(patch.property_id)
  if (typeof patch.is_owner === 'boolean') body.is_owner = patch.is_owner
  body.start_date = toYMD(patch.start_date) ?? null
  body.end_date = toYMD(patch.end_date) ?? null
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/residents/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: body,
  })
}

export async function apiDeleteResident(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/residents/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

export type MyProperty = { id: number; name: string }

export async function apiGetMyProperties(): Promise<MyProperty[]> {
  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/residents/my-properties',
    method: 'get',
  })
  const items =
    (Array.isArray(raw) && (raw as unknown[])) ||
    (isRecord(raw) && Array.isArray((raw as Dict).data) && (((raw as Dict).data as unknown[]) ?? [])) ||
    (isRecord(raw) && Array.isArray((raw as Dict).results) && (((raw as Dict).results as unknown[]) ?? [])) ||
    []
  return (items as unknown[]).map((p) => {
    const r = isRecord(p) ? (p as Dict) : {}
    const idCandidate = r.id ?? r.property_id ?? 0
    const idNum = Number(typeof idCandidate === 'string' || typeof idCandidate === 'number' ? idCandidate : 0)
    const nameCandidate = typeof r.name === 'string' ? r.name : typeof r.address === 'string' ? r.address : ''
    const name = nameCandidate || `Propiedad #${idNum}`
    return { id: idNum, name }
  })
}

const ResidentsApi = {
  apiGetResidentsList,
  apiCreateResident,
  apiGetResidentById,
  apiUpdateResident,
  apiDeleteResident,
  apiGetMyProperties,
}

export default ResidentsApi
