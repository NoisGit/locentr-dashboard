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
  isOwner?: boolean
  startDate?: string
  endDate?: string
  img?: string
  status?: string
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
  if (typeof v === 'number') return String(v)
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

function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const r = raw as Dict
  const items =
    (Array.isArray((r as Dict)?.residents) && ((r as Dict).residents as unknown[])) ||
    (Array.isArray((r as Dict)?.items) && ((r as Dict).items as unknown[])) ||
    (Array.isArray((r as Dict)?.list) && ((r as Dict).list as unknown[])) ||
    (isRecord((r as Dict)?.data) && Array.isArray(((r as Dict).data as Dict).residents) && ((((r as Dict).data as Dict).residents as unknown[]) ?? [])) ||
    (isRecord((r as Dict)?.data) && Array.isArray(((r as Dict).data as Dict).items) && ((((r as Dict).data as Dict).items as unknown[]) ?? [])) ||
    (isRecord((r as Dict)?.data) && Array.isArray(((r as Dict).data as Dict).list) && ((((r as Dict).data as Dict).list as unknown[]) ?? [])) ||
    (Array.isArray((r as Dict)?.data) && ((r as Dict).data as unknown[])) ||
    (Array.isArray((r as Dict)?.results) && ((r as Dict).results as unknown[])) ||
    (Array.isArray(raw) && (raw as unknown[])) ||
    []
  const cand =
    (r as Dict)?.total ??
    (r as Dict)?.count ??
    (isRecord((r as Dict)?.data) ? ((r as Dict).data as Dict).total : undefined) ??
    (isRecord((r as Dict)?.pagination) ? ((r as Dict).pagination as Dict).total : undefined)
  const total = Number(typeof cand === 'number' || typeof cand === 'string' ? cand : items.length)
  return { items, total }
}

function adaptResidentRow(u: unknown): ResidentRow {
  const r = isRecord(u) ? u : ({} as Dict)
  const rawId = (r.id ?? r.resident_id ?? r._id) as unknown
  const cleanId = String(rawId ?? '').replace(/\/+$/, '')
  const userIdRaw = (r.user_id ?? r.userId ?? (isRecord(r.user) ? (r.user as Dict).id : undefined) ?? (isRecord(r.user) ? (r.user as Dict)._id : undefined)) as unknown
  const propertyIdRaw = (r.property_id ?? r.propertyId ?? (isRecord(r.property) ? (r.property as Dict).id : undefined) ?? (isRecord(r.property) ? (r.property as Dict)._id : undefined)) as unknown
  const first = (isRecord(r.user) ? (r.user as Dict).first_name : r.first_name) as unknown
  const last = (isRecord(r.user) ? (r.user as Dict).last_name : r.last_name) as unknown
  const nameParts = [str(first), str(last)].filter(Boolean)
  const joinedName = nameParts.length ? nameParts.join(' ') : undefined
  const preferredName = (r.user_name ?? (isRecord(r.user) ? (r.user as Dict).name : undefined) ?? joinedName ?? r.name) as unknown
  const userName = str(preferredName)
  const propertyName = str(r.property_name ?? (isRecord(r.property) ? (r.property as Dict).name : undefined) ?? (isRecord(r.property) ? (r.property as Dict).address : undefined) ?? r.propertyAddress)
  const startDate = r.start_date ?? r.startDate ?? (isRecord(r.dates) ? (r.dates as Dict).start : undefined) ?? (isRecord(r.period) ? (r.period as Dict).start : undefined)
  const endDate = r.end_date ?? r.endDate ?? (isRecord(r.dates) ? (r.dates as Dict).end : undefined) ?? (isRecord(r.period) ? (r.period as Dict).end : undefined)
  const img =
    (isRecord(r.user) ? ((r.user as Dict).avatar as unknown) : undefined) ??
    (isRecord(r.user) ? ((r.user as Dict).avatar_url as unknown) : undefined) ??
    (r.avatar_url as unknown) ??
    (r.avatar as unknown) ??
    ''
  return {
    id: cleanId,
    userId: String(userIdRaw ?? ''),
    propertyId: String(propertyIdRaw ?? ''),
    userName,
    propertyName,
    isOwner: Boolean(r.is_owner ?? r.isOwner ?? r.owner ?? (isRecord(r.relation) ? (r.relation as Dict).is_owner : undefined) ?? false),
    startDate: toYMD(startDate),
    endDate: toYMD(endDate),
    img: typeof img === 'string' ? img : '',
    status: str(r.status),
  }
}

function tryParsePythonishDict(input: unknown): unknown | null {
  if (typeof input !== 'string') return null
  const approx = input.replace(/None\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/'/g, '"')
  try {
    return JSON.parse(approx)
  } catch {
    return null
  }
}

function trySalvageFromError(err: unknown): { list: ResidentRow[]; total: number } | null {
  const e = isRecord(err) ? err : {}
  const resp = isRecord(e.response) ? (e.response as Dict) : {}
  const data = (resp.data as unknown) ?? undefined
  const candidates: unknown[] = []
  if (isRecord(data)) {
    const d = data as Dict
    if (Array.isArray(d.detail) && d.detail.length) {
      for (const it of d.detail as unknown[]) {
        if (isRecord(it)) {
          const di = it as Dict
          if (di.input) candidates.push(di.input)
          if (isRecord(di.ctx) && (di.ctx as Dict).input) candidates.push((di.ctx as Dict).input as unknown)
          if (isRecord(di.ctx) && (di.ctx as Dict).error) candidates.push((di.ctx as Dict).error as unknown)
        }
      }
    }
    if ((d as Dict).input_value) candidates.push((d as Dict).input_value as unknown)
    if ((d as Dict).input) candidates.push((d as Dict).input as unknown)
    candidates.push(data)
  } else if (typeof data === 'string') {
    candidates.push(data)
  }
  for (const c of candidates) {
    let obj: unknown = c
    if (typeof obj === 'string') obj = tryParsePythonishDict(obj) ?? {}
    if (isRecord(obj)) {
      const { items, total } = pickItemsAndTotal(obj)
      if (Array.isArray(items)) {
        const list = items.map(adaptResidentRow)
        return { list, total: Number(total ?? list.length) }
      }
      const d = obj as Dict
      if (isRecord(d.data) && Array.isArray((d.data as Dict).residents)) {
        const list = ((d.data as Dict).residents as unknown[]).map(adaptResidentRow)
        const t = Number(d.total ?? (d.data as Dict).total ?? list.length)
        return { list, total: t }
      }
    }
  }
  return null
}

async function tryRequest(params?: Record<string, unknown>) {
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/residents/',
    method: 'get',
    params,
  })
}

export async function apiGetResidentsList<T = GetResidentsListResponse, Q extends TableQueries = TableQueries>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as TableQueries).pageIndex ?? 1))
  const pageSize = Math.max(1, Number((params as TableQueries).pageSize ?? 10))
  const skip = (pageIndex - 1) * pageSize
  const qpFull: Record<string, unknown> = { pageIndex, pageSize, limit: pageSize, skip }
  const qRaw = (params as TableQueries).query
  const q = (qRaw == null ? '' : String(qRaw)).trim()
  if (q) {
    qpFull.query = q
    qpFull.search = q
    qpFull.q = q
    qpFull.name = q
    qpFull.user_name = q
    qpFull.property_name = q
    qpFull['filters[name]'] = q
  }
  const propertyId = (params as TableQueries).propertyId
  if (propertyId !== '' && propertyId != null) qpFull.property_id = Number(propertyId)
  const userId = (params as TableQueries).userId
  if (userId !== '' && userId != null) qpFull.user_id = Number(userId)
  const isOwner = boolOrUndef((params as TableQueries).isOwner)
  if (typeof isOwner === 'boolean') qpFull.is_owner = isOwner
  const startFrom = toYMD((params as TableQueries).startDateFrom)
  if (startFrom) qpFull.start_date_from = startFrom
  const endTo = toYMD((params as TableQueries).endDateTo)
  if (endTo) qpFull.end_date_to = endTo
  const commId = (params as TableQueries).communityId
  if (commId !== '' && commId != null) qpFull.community_id = Number(commId)
  if ((params as TableQueries).sort?.key) qpFull['sort[key]'] = (params as TableQueries).sort?.key
  if ((params as TableQueries).sort?.order) qpFull['sort[order]'] = (params as TableQueries).sort?.order
  if (!(params as TableQueries).sort) {
    qpFull['sort[key]'] = 'id'
    qpFull['sort[order]'] = 'desc'
  }
  try {
    const resp = await tryRequest(qpFull)
    const { items, total } = pickItemsAndTotal(resp)
    const list: ResidentRow[] = items.map(adaptResidentRow)
    return { list, total } as T
  } catch (errFull: unknown) {
    const salvaged = trySalvageFromError(errFull)
    if (salvaged) return { list: salvaged.list, total: salvaged.total } as T
    try {
      const resp = await tryRequest({ limit: pageSize, skip })
      const { items, total } = pickItemsAndTotal(resp)
      const list: ResidentRow[] = items.map(adaptResidentRow)
      return { list, total } as T
    } catch (errBasic: unknown) {
      const salvaged2 = trySalvageFromError(errBasic)
      if (salvaged2) return { list: salvaged2.list, total: salvaged2.total } as T
      try {
        const resp = await tryRequest()
        const { items, total } = pickItemsAndTotal(resp)
        const list: ResidentRow[] = items.map(adaptResidentRow)
        return { list, total } as T
      } catch {
        return { list: [], total: 0 } as T
      }
    }
  }
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
  return adaptResidentRow(resp)
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
    const idNum = Number(r.id ?? r.property_id ?? 0)
    const name = str(r.name ?? r.address) || `Propiedad #${idNum}`
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
