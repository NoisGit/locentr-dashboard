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

/** Soporta { data:[...], total }, { list:[...], total }, { results:[...], total } o array plano */
function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  if (isRecord(raw)) {
    const r = raw as Dict
    const candidates = [r.list, r.items, r.results, r.data, raw]
    let items: unknown[] = []
    for (const c of candidates) {
      if (Array.isArray(c)) { items = c; break }
      if (isRecord(c)) {
        const nested = (c as Dict).list ?? (c as Dict).items ?? (c as Dict).results
        if (Array.isArray(nested)) { items = nested; break }
      }
    }
    if (items.length) {
      const total =
        typeof r.total === 'number'
          ? r.total
          : typeof r.count === 'number'
          ? Number(r.count)
          : typeof (r.pagination as Dict | undefined)?.['total'] === 'number'
          ? Number((r.pagination as Dict).total)
          : items.length
      return { items, total: Number(total ?? items.length) }
    }
  }
  const items = Array.isArray(raw) ? (raw as unknown[]) : []
  return { items, total: items.length }
}

function adaptResidentDetailed(u: unknown): ResidentRow {
  const r: Dict = isRecord(u) ? u : {}
  const id = String(r.id ?? r._id ?? '')
  const userId = String(r.user_id ?? r.userId ?? '')
  const propertyId = String(r.property_id ?? r.propertyId ?? '')
  const userName = str(r.user_name ?? r.userName)
  const propertyNumber = str(r.property_number ?? r.propertyNumber)

  const floorRaw = r.floor ?? r.level
  const floor: number | string | undefined =
    typeof floorRaw === 'number'
      ? floorRaw
      : typeof floorRaw === 'string' && floorRaw.trim() !== ''
      ? floorRaw
      : undefined

  const block = str(r.block ?? r.block_tower ?? r.tower ?? r.building)
  const homeRole = str(r.home_role ?? r.homeRole ?? r.role_name)
  const isOwner = Boolean(r.is_owner ?? r.isOwner)
  const startDate = toYMD(r.start_date ?? r.startDate ?? r.start ?? r.created_at ?? r.createdAt)
  const endDate = toYMD(r.end_date ?? r.endDate ?? r.end ?? r.finish_date)
  const idNumber = str(r.id_number ?? r.rut ?? r.dni)
  const userEmail = str(r.user_email ?? r.email)
  const communityName = str(r.community_name ?? r.communityName)

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
  // 1-based como en el resto del app
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize  = Math.max(1, Number(params.pageSize ?? 10))

  // ⛳ Igual que en Properties: pedimos un “bucket” grande y paginamos en cliente
  const skip  = 0
  const limit = 100

  const qp: Record<string, unknown> = {
    // Server-side (bucket grande)
    skip,
    limit,
    // Metadatos por si el backend los usa (no molestan)
    pageIndex,
    pageSize,
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

  if (params.sort?.key)   qp['sort[key]'] = params.sort.key
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

  const { items, total } = pickItemsAndTotal(resp)

  // mapeo
  const all: ResidentRow[] = items.map(adaptResidentDetailed)

  // paginación en cliente
  const start = (pageIndex - 1) * pageSize
  const end   = start + pageSize
  const pageSlice = all.slice(start, end)

  return { list: pageSlice, total: Number(total ?? all.length) } as T
}

export async function apiCreateResident(payload: {
  user_id: number | string
  property_id: number | string
  is_owner?: boolean
  start_date?: string | Date
  end_date?: string | Date
  home_role?: string
}) {
  const body: Record<string, unknown> = {
    user_id: Number(payload.user_id),
    property_id: Number(payload.property_id),
    start_date: toYMD(payload.start_date) ?? null,
    end_date: toYMD(payload.end_date) ?? null,
  }
  if (typeof payload.is_owner === 'boolean') body.is_owner = payload.is_owner
  if (typeof payload.home_role === 'string') body.home_role = payload.home_role
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
    home_role?: string
  },
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const body: Record<string, unknown> = {}
  if (patch.user_id != null) body.user_id = Number(patch.user_id)
  if (patch.property_id != null) body.property_id = Number(patch.property_id)
  if (typeof patch.is_owner === 'boolean') body.is_owner = patch.is_owner
  body.start_date = toYMD(patch.start_date) ?? null
  body.end_date = toYMD(patch.end_date) ?? null
  if (typeof patch.home_role === 'string') body.home_role = patch.home_role
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
