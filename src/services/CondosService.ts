// src/services/CondosService.ts
import ApiService from '@/services/ApiService'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  // 👇 vienen del store de filtros (opcional)
  typeId?: number | ''
  type_id?: number
}

export type CondoRow = {
  id: number | string
  name: string
  address?: string
  type?: string   // etiqueta de display ("Edificio" | "Condominio")
  img?: string
  status?: string
}

export type GetCondosListResponse = {
  list: CondoRow[]
  total: number
}

/* ---------- Helpers para mapear tipo ---------- */
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
  // admite objeto { id/name }, string o número
  const raw = typeof input === 'object' ? (input.id ?? input.name ?? '') : input
  const s = String(raw).trim().toLowerCase()
  return TYPE_TO_ID[s]
}

function toTypeLabel(input: any): string {
  if (input == null) return ''
  // si viene numérico o string numérico
  const n = Number(input)
  if (!Number.isNaN(n) && (n === 1 || n === 2)) return ID_TO_TYPE[n as 1 | 2]

  // si viene string u objeto (name)
  const raw = typeof input === 'object' ? (input.name ?? input.id ?? '') : input
  const s = String(raw).trim().toLowerCase()
  const id = TYPE_TO_ID[s]
  return id ? ID_TO_TYPE[id] : (String(input) || '')
}

/* ---------- Adapter de filas ---------- */
function adaptCondoRow(u: any): CondoRow {
  const rawId = u?.id ?? u?.community_id ?? u?._id ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')

  const name =
    u?.name ??
    u?.community_name ??
    u?.title ??
    `${u?.first_name ?? ''} ${u?.last_name ?? ''}`.trim()

  // lee id o variantes de tipo
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
    type: displayType, // siempre “Edificio” | “Condominio” si es posible
    img: u?.img ?? u?.avatar ?? u?.avatar_url ?? '',
    status: u?.status ?? '',
  }
}

/* ---------- Normalizador de respuesta paginada ---------- */
function pickItemsAndTotal(raw: any) {
  const items =
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.communities) && raw.communities) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.list) && raw.data.list) ||
    (Array.isArray(raw?.data?.communities) && raw.data.communities) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []

  const total = Number(
    raw?.total ??
      raw?.count ??
      raw?.data?.total ??
      raw?.pagination?.total ??
      items.length,
  )

  return { items, total }
}

/* ---------- Listado ---------- */
export async function apiGetCondosList<
  T = GetCondosListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number((params as any).pageIndex ?? 1))
  const pageSize  = Math.max(1, Number((params as any).pageSize ?? 10))

  const qp: Record<string, unknown> = { pageIndex, pageSize }

  // 🔎 búsqueda por nombre: mandamos varios alias para cubrir backends distintos
  const qRaw = (params as any).query
  const q = (qRaw == null ? '' : String(qRaw)).trim()
  if (q) {
    qp.query = q
    qp.search = q
    qp.q = q
    qp.name = q
    // opcionales comunes:
    qp['filters[name]'] = q
    // si tu backend usa otro patrón (like/ilike), puedes habilitar uno:
    // qp['name_like'] = q
    // qp['name__ilike'] = q
  }

  // filtro por tipo (desde filterData.typeId)
  const typeId = (params as any).typeId ?? (params as any).type_id
  if (typeId !== '' && typeId != null) {
    qp.type_id = Number(typeId)
  }

  // orden
  if ((params as any).sort?.key)   qp['sort[key]']   = (params as any).sort.key
  if ((params as any).sort?.order) qp['sort[order]'] = (params as any).sort.order
  if (!(params as any).sort) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }

  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/communities/', // colección con slash final
    method: 'get',
    params: qp,
  })

  const { items, total } = pickItemsAndTotal(resp)
  const list: CondoRow[] = items.map(adaptCondoRow)
  return { list, total } as T
}

/* ---------- Crear (mapea type → type_id) ---------- */
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

/* ---------- Obtener por ID ---------- */
export async function apiGetCondoById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return adaptCondoRow(resp)
}

/* ---------- Actualizar (mapea type → type_id) ---------- */
export async function apiUpdateCondo(
  id: string | number,
  patch: Record<string, unknown>,
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

/* ---------- Eliminar ---------- */
export async function apiDeleteCondo(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/communities/id/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}
