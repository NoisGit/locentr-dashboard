import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  typeId?: number | ''
  type_id?: number
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

function toTypeId(input: any): number | undefined {
  if (input == null) return undefined
  const raw = typeof input === 'object' ? (input.id ?? input.name ?? '') : input
  const s = String(raw).trim().toLowerCase()
  return TYPE_TO_ID[s]
}

function toTypeLabel(input: any): string {
  if (input == null) return ''
  const n = Number(input)
  if (!Number.isNaN(n) && (n === 1 || n === 2)) return ID_TO_TYPE[n as 1 | 2]
  const raw = typeof input === 'object' ? (input.name ?? input.id ?? '') : input
  const s = String(raw).trim().toLowerCase()
  const id = TYPE_TO_ID[s]
  return id ? ID_TO_TYPE[id] : String(input) || ''
}

function pickArray(raw: any): any[] {
  return (
    (Array.isArray(raw?.roles) && raw.roles) ||
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.communities) && raw.communities) ||
    (Array.isArray(raw?.types) && raw.types) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.list) && raw.data.list) ||
    (Array.isArray(raw?.data?.communities) && raw.data.communities) ||
    (Array.isArray(raw?.data?.types) && raw.data.types) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []
  )
}

function pickItemsAndTotal(raw: any) {
  const items = pickArray(raw)
  const total = Number(
    raw?.total ??
      raw?.count ??
      raw?.data?.total ??
      raw?.pagination?.total ??
      items.length
  )
  return { items, total }
}

function adaptCondoRow(u: any): CondoRow {
  const rawId = u?.id ?? u?.community_id ?? u?._id ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')
  const name =
    u?.name ??
    u?.community_name ??
    u?.title ??
    `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim()
  const rawTypeId =
    u?.type_id ?? u?.community_type_id ?? u?.typeId ?? u?.communityTypeId
  const rawType =
    u?.type?.name ??
    u?.type ??
    u?.community_type?.name ??
    u?.community_type ??
    u?.type_name ??
    u?.community_type_name ??
    u?.kind ??
    u?.category ??
    u?.property_type
  const displayType = toTypeLabel(rawTypeId ?? rawType)
  return {
    id: cleanId,
    name: name || '',
    address: u?.address ?? u?.street ?? '',
    type: displayType,
    img: u?.img ?? u?.avatar ?? u?.avatar_url ?? '',
    status: u?.status ?? '',
  }
}

export async function apiGetCondosList<
  T = GetCondosListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as any).pageIndex ?? 1))
  const pageSize = Math.max(1, Number((params as any).pageSize ?? 10))
  const qp: Record<string, unknown> = { pageIndex, pageSize }
  const qRaw = (params as any).query
  const q = (qRaw == null ? '' : String(qRaw)).trim()
  if (q) {
    qp.query = q
    qp.search = q
    qp.q = q
    qp.name = q
    qp['filters[name]'] = q
  }
  const typeId = (params as any).typeId ?? (params as any).type_id
  if (typeId !== '' && typeId != null) {
    qp.type_id = Number(typeId)
  }
  if ((params as any).sort?.key) qp['sort[key]'] = (params as any).sort.key
  if ((params as any).sort?.order) qp['sort[order]'] = (params as any).sort.order
  if (!(params as any).sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/communities/',
    method: 'get',
    params: qp,
  })
  const { items, total } = pickItemsAndTotal(resp)
  const list: CondoRow[] = items.map(adaptCondoRow)
  return { list, total } as T
}

function normalizeType(t: any): CommunityType {
  const id = Number(t?.id ?? t?.type_id ?? t?.value ?? t?.key ?? NaN)
  const nameRaw =
    t?.name ?? t?.type_name ?? t?.label ?? (Number.isFinite(id) ? ID_TO_TYPE[id as 1 | 2] : undefined)
  const name = String(nameRaw ?? '').trim() || (Number.isFinite(id) ? ID_TO_TYPE[id as 1 | 2] : '')
  return { id: Number.isFinite(id) ? id : (toTypeId(nameRaw) ?? 0), name }
}

export async function apiGetCommunityTypes(key?: string): Promise<CommunityType[]> {
  const url = typeof key === 'string' && key ? key : '/api/v1/communities/types'
  const resp = await ApiService.fetchDataWithAxios<any>({ url, method: 'get' })
  return pickArray(resp).map(normalizeType).filter(t => t.id && t.name)
}

export async function apiCreateCondo(payload: Record<string, unknown>) {
  const body: Record<string, unknown> = { ...payload }
  const tid = toTypeId((payload as any)?.type ?? (payload as any)?.type_id)
  if (tid) body.type_id = tid
  delete body.type
  return ApiService.fetchDataWithAxios({
    url: '/api/v1/communities/',
    method: 'post',
    data: body,
  })
}

export async function apiGetCondoById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<any>({
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
  const tid = toTypeId((patch as any)?.type ?? (patch as any)?.type_id)
  if (tid) body.type_id = tid
  delete body.type
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: body,
  })
}

export async function apiDeleteCondo(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
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
