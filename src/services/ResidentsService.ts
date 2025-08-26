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

function toYMD(input: any): string | undefined {
  if (input === '' || input == null) return undefined
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) return input.trim()
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return undefined
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function boolOrUndef(v: any): boolean | undefined {
  if (v === '' || v == null) return undefined
  if (typeof v === 'boolean') return v
  const s = String(v).toLowerCase().trim()
  if (s === 'true' || s === '1') return true
  if (s === 'false' || s === '0') return false
  return undefined
}

function pickItemsAndTotal(raw: any) {
  const items =
    (Array.isArray(raw?.residents) && raw.residents) ||
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.data?.residents) && raw.data.residents) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.list) && raw.data.list) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []

  const total = Number(
    raw?.total ??
      raw?.count ??
      raw?.data?.total ??
      raw?.pagination?.total ??
      items.length
  )

  return { items, total }
}

function adaptResidentRow(u: any): ResidentRow {
  const rawId = u?.id ?? u?.resident_id ?? u?._id ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')

  const userId =
    u?.user_id ?? u?.userId ?? u?.user?.id ?? u?.user?._id ?? ''
  const propertyId =
    u?.property_id ?? u?.propertyId ?? u?.property?.id ?? u?.property?._id ?? ''

  const nameParts = [
    u?.user?.first_name ?? u?.first_name,
    u?.user?.last_name ?? u?.last_name,
  ].filter(Boolean)
  const joinedName = nameParts.length ? nameParts.join(' ') : undefined
  const preferredName = u?.user_name ?? u?.user?.name ?? joinedName ?? u?.name
  const userName = String(preferredName ?? '')

  const propertyName =
    u?.property_name ??
    u?.property?.name ??
    u?.property?.address ??
    u?.propertyAddress ??
    ''

  const startDate =
    u?.start_date ?? u?.startDate ?? u?.dates?.start ?? u?.period?.start ?? ''
  const endDate =
    u?.end_date ?? u?.endDate ?? u?.dates?.end ?? u?.period?.end ?? ''

  return {
    id: cleanId,
    userId: String(userId ?? ''),
    propertyId: String(propertyId ?? ''),
    userName,
    propertyName: String(propertyName ?? ''),
    isOwner: Boolean(u?.is_owner ?? u?.isOwner ?? u?.owner ?? u?.relation?.is_owner ?? false),
    startDate: toYMD(startDate) || undefined,
    endDate: toYMD(endDate) || undefined,
    img: u?.user?.avatar ?? u?.user?.avatar_url ?? u?.avatar_url ?? u?.avatar ?? '',
    status: u?.status ?? '',
  }
}

function tryParsePythonishDict(input: any): any | null {
  if (typeof input !== 'string') return null
  const approx = input
    .replace(/None\b/g, 'null')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/'/g, '"')
  try {
    return JSON.parse(approx)
  } catch {
    return null
  }
}

function trySalvageFromError(err: any): { list: ResidentRow[]; total: number } | null {
  const data = err?.response?.data
  const candidates: any[] = []

  if (data && typeof data === 'object') {
    if (Array.isArray(data?.detail) && data.detail.length) {
      for (const d of data.detail) {
        if (d?.input) candidates.push(d.input)
        if (d?.ctx?.input) candidates.push(d.ctx.input)
        if (d?.ctx?.error) candidates.push(d.ctx.error)
      }
    }
    if (data?.input_value) candidates.push(data.input_value)
    if (data?.input) candidates.push(data.input)
    candidates.push(data)
  } else if (typeof data === 'string') {
    candidates.push(data)
  }

  for (const c of candidates) {
    let obj: any = c
    if (typeof obj === 'string') obj = tryParsePythonishDict(obj) ?? {}
    if (obj && typeof obj === 'object') {
      const { items, total } = pickItemsAndTotal(obj)
      if (Array.isArray(items)) {
        const list = items.map(adaptResidentRow)
        return { list, total: Number(total ?? list.length) }
      }
      if (Array.isArray(obj?.data?.residents)) {
        const list = obj.data.residents.map(adaptResidentRow)
        const t = Number(obj?.total ?? obj?.data?.total ?? list.length)
        return { list, total: t }
      }
    }
  }

  return null
}

async function tryRequest(params?: Record<string, unknown>) {
  return ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/residents/',
    method: 'get',
    params,
  })
}

export async function apiGetResidentsList<
  T = GetResidentsListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as any).pageIndex ?? 1))
  const pageSize  = Math.max(1, Number((params as any).pageSize ?? 10))
  const skip = (pageIndex - 1) * pageSize

  const qpFull: Record<string, unknown> = {
    pageIndex,
    pageSize,
    limit: pageSize,
    skip,
  }

  const qRaw = (params as any).query
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

  const propertyId = (params as any).propertyId
  if (propertyId !== '' && propertyId != null) qpFull.property_id = Number(propertyId)

  const userId = (params as any).userId
  if (userId !== '' && userId != null) qpFull.user_id = Number(userId)

  const isOwner = boolOrUndef((params as any).isOwner)
  if (typeof isOwner === 'boolean') qpFull.is_owner = isOwner

  const startFrom = toYMD((params as any).startDateFrom)
  if (startFrom) qpFull.start_date_from = startFrom

  const endTo = toYMD((params as any).endDateTo)
  if (endTo) qpFull.end_date_to = endTo

  if ((params as any).sort?.key)   qpFull['sort[key]']   = (params as any).sort.key
  if ((params as any).sort?.order) qpFull['sort[order]'] = (params as any).sort.order
  if (!(params as any).sort) {
    qpFull['sort[key]'] = 'id'
    qpFull['sort[order]'] = 'desc'
  }

  try {
    const resp = await tryRequest(qpFull)
    const { items, total } = pickItemsAndTotal(resp)
    const list: ResidentRow[] = items.map(adaptResidentRow)
    return { list, total } as T
  } catch (errFull: any) {
    const salvaged = trySalvageFromError(errFull)
    if (salvaged) return { list: salvaged.list, total: salvaged.total } as T

    // Fallback 1: solo paginación básica (skip/limit)
    try {
      const resp = await tryRequest({ limit: pageSize, skip })
      const { items, total } = pickItemsAndTotal(resp)
      const list: ResidentRow[] = items.map(adaptResidentRow)
      return { list, total } as T
    } catch (errBasic: any) {
      const salvaged2 = trySalvageFromError(errBasic)
      if (salvaged2) return { list: salvaged2.list, total: salvaged2.total } as T

      // Fallback 2: sin ningún parámetro
      try {
        const resp = await tryRequest()
        const { items, total } = pickItemsAndTotal(resp)
        const list: ResidentRow[] = items.map(adaptResidentRow)
        return { list, total } as T
      } catch (errBare: any) {
        const salvaged3 = trySalvageFromError(errBare)
        if (salvaged3) return { list: salvaged3.list, total: salvaged3.total } as T

        // Último recurso: no romper la UI
        // eslint-disable-next-line no-console
        console.warn('[ResidentsService] Lista de residentes: backend 500 en todos los intentos', {
          errFull: errFull?.response?.data ?? errFull,
          errBasic: errBasic?.response?.data ?? errBasic,
          errBare: errBare?.response?.data ?? errBare,
        })
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
  }
  if (typeof payload.is_owner === 'boolean') body.is_owner = payload.is_owner
  const sd = toYMD(payload.start_date)
  if (sd) body.start_date = sd
  const ed = toYMD(payload.end_date)
  if (ed) body.end_date = ed

  return ApiService.fetchDataWithAxios({
    url: '/api/v1/residents/',
    method: 'post',
    data: body,
  })
}

export async function apiGetResidentById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<any>({
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
  const sd = toYMD(patch.start_date)
  if (sd) body.start_date = sd
  const ed = toYMD(patch.end_date)
  if (ed) body.end_date = ed

  return ApiService.fetchDataWithAxios({
    url: `/api/v1/residents/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: body,
  })
}

export async function apiDeleteResident(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/residents/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

export type MyProperty = { id: number; name: string }
export async function apiGetMyProperties(): Promise<MyProperty[]> {
  const raw = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/residents/my-properties',
    method: 'get',
  })
  const items =
    (Array.isArray(raw) && raw) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    []
  return items.map((p: any) => ({
    id: Number(p?.id ?? p?.property_id ?? 0),
    name: String(p?.name ?? p?.address ?? '').trim() || `Propiedad #${p?.id}`,
  }))
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
