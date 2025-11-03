// src/services/IncidentsService.ts
import ApiService from '@/services/ApiService'
import { apiGetMyCommunities, apiListCommunities, type Community } from '@/services/CommunitiesService'

export type SortParam = { key?: string; order?: 'asc' | 'desc' }

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: SortParam
  communityId?: number | string | '' | null
  status_in?: Array<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>
}

export type IncidentRow = {
  id: number | string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | string
  property_code?: string | number
  created_at?: string
  community_id?: number | string
  community_name?: string
  /** <- Agregamos para que el detalle pueda mostrarla directo */
  description?: string
}

export type GetIncidentsListResponse = {
  list: IncidentRow[]
  total: number
}

export type IncidentUpdateRow = {
  id: number | string
  author_name?: string
  created_at: string
  text: string
}

export type GetIncidentUpdatesResponse = {
  list: IncidentUpdateRow[]
  total: number
}

/* ---------------- Utils runtime (sin any) ---------------- */
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
function toStrOrNum(v: unknown): string | number | undefined {
  if (typeof v === 'string' && v.trim() !== '') return v
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}
function trimSlashes(s: string): string {
  return s.replace(/\/+$/, '')
}

/* ---------------- De-dupe communities fetch ---------------- */
let _communityIdsCache: Array<string | number> | null = null
let _communityIdsPromise: Promise<Array<string | number>> | null = null

async function getAllCommunityIds(): Promise<Array<string | number>> {
  if (_communityIdsCache) return _communityIdsCache
  if (_communityIdsPromise) return _communityIdsPromise

  _communityIdsPromise = (async () => {
    let list: Community[] = []
    try {
      // 1) Preferimos “mis comunidades” si existe
      list = await apiGetMyCommunities<Community[]>()
    } catch {
      // ignore
    }
    if (!list.length) {
      try {
        // 2) Fallback a /communities (una sola vez)
        list = await apiListCommunities<Community[]>({ pageIndex: 1, pageSize: 200 })
      } catch {
        // ignore
      }
    }
    const ids = list
      .map((c) => c.id)
      .filter((id) => id !== undefined && id !== null)
    const deduped = Array.from(new Set(ids.map((x) => String(x)))).map((x) =>
      /^\d+$/.test(x) ? Number(x) : x,
    )
    _communityIdsCache = deduped
    return deduped
  })()

  return _communityIdsPromise
}

/* (opcional) si en algún flujo cambian las comunidades y quieres refrescar: */
// export function invalidateCommunitiesCache() {
//   _communityIdsCache = null
//   _communityIdsPromise = null
// }

/* ---------------- Mapeos ---------------- */
function pickItemsAndTotal(raw: unknown): { items: unknown[]; total: number } {
  const candidates = [
    get(raw, 'items'),
    get(get(raw, 'data'), 'items'),
    get(raw, 'list'),
    get(get(raw, 'data'), 'list'),
    get(raw, 'results'),
    get(get(raw, 'data'), 'results'),
    get(raw, 'incidents'),
    get(get(raw, 'data'), 'incidents'),
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

function mapIncidentRow(p: unknown): IncidentRow {
  const o = isObject(p) ? p : {}

  const idRaw =
    get(o, 'id') ??
    get(o, 'incident_id') ??
    get(o, 'incidentId') ??
    get(o, '_id') ??
    ''
  const idStr = toStr(idRaw) ?? ''
  const id = idStr !== '' ? trimSlashes(idStr) : String(idRaw ?? '')

  const title =
    toStr(get(o, 'title')) ??
    toStr(get(o, 'name')) ??
    toStr(get(o, 'subject')) ??
    ''

  const status =
    toStr(get(o, 'status')) ??
    toStr(get(o, 'state')) ??
    ''

  const priority =
    toStr(get(o, 'priority')) ??
    toStr(get(o, 'severity')) ??
    undefined

  const propertyCode =
    toStr(get(o, 'property_code')) ??
    toStr(get(o, 'propertyCode')) ??
    toStr(get(o, 'property_number')) ??
    toStr(get(o, 'property')) ??
    undefined

  const createdAt =
    toStr(get(o, 'created_at')) ??
    toStr(get(o, 'createdAt')) ??
    toStr(get(o, 'created')) ??
    undefined

  // 🔸 NUEVO: mapeamos description (varios alias por si acaso)
  const description =
    toStr(get(o, 'description')) ??
    toStr(get(o, 'desc')) ??
    toStr(get(o, 'details')) ??
    toStr(get(o, 'detail')) ??
    undefined

  const community = isObject(get(o, 'community')) ? (get(o, 'community') as Record<string, unknown>) : undefined
  const communityId = get(o, 'community_id') ?? (community ? get(community, 'id') : undefined)
  const communityName = get(o, 'community_name') ?? (community ? get(community, 'name') : undefined)

  const mapped: IncidentRow = {
    id,
    title: title || String(id),
    status: (status as IncidentRow['status']) || 'PENDING',
    priority: priority as IncidentRow['priority'],
    property_code: propertyCode,
    created_at: createdAt,
  }

  const cid = toStrOrNum(communityId)
  if (cid !== undefined) mapped.community_id = cid
  const cname = toStr(communityName)
  if (cname !== undefined) mapped.community_name = cname
  if (description !== undefined) mapped.description = description

  return mapped
}

function compareBySort(a: IncidentRow, b: IncidentRow, sort?: SortParam): number {
  const key = sort?.key ?? 'created_at'
  const order = (sort?.order ?? 'desc') === 'asc' ? 1 : -1
  const va = (a as Record<string, unknown>)[key as string]
  const vb = (b as Record<string, unknown>)[key as string]

  if (key === 'created_at') {
    const da = Date.parse(String(va ?? ''))
    const db = Date.parse(String(vb ?? ''))
    if (Number.isNaN(da) && Number.isNaN(db)) return 0
    if (Number.isNaN(da)) return 1
    if (Number.isNaN(db)) return -1
    return (da - db) * order
  }

  if (va == null && vb == null) return 0
  if (va == null) return 1
  if (vb == null) return -1
  if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * order
  return String(va).localeCompare(String(vb)) * order
}

/* ---------------- API ---------------- */
export async function apiGetIncidentsList<
  T = GetIncidentsListResponse,
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

  const st = (params as TableQueries).status_in
  if (Array.isArray(st) && st.length) {
    qp.status_in = st.join(',')
  }

  const cid = (params as TableQueries).communityId

  // Sin comunidad -> agregamos en cliente (no existe /all para GET)
  if (cid === '' || cid == null) {
    const ids = await getAllCommunityIds()
    if (!ids.length) return { list: [], total: 0 } as T

    // Traemos bastante por comunidad y luego paginamos localmente
    const innerParams = {
      ...qp,
      pageIndex: 1,
      pageSize: 1000,
    }

    const reqs = ids.map((id) =>
      ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
        url: `/api/v1/incidents/community/${encodeURIComponent(String(id))}`,
        method: 'get',
        params: innerParams,
      }).catch(() => ({ data: [] } as unknown)),
    )

    const settled = await Promise.allSettled(reqs)
    const allItems: unknown[] = []
    let totalAcc = 0
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        const { items, total } = pickItemsAndTotal(r.value)
        allItems.push(...items)
        totalAcc += typeof total === 'number' ? total : items.length
      }
    }

    let mapped = allItems.map(mapIncidentRow)
    mapped = mapped.sort((a, b) => compareBySort(a, b, s))

    const start = (pageIndex - 1) * pageSize
    const sliced = mapped.slice(start, start + pageSize)

    return { list: sliced, total: totalAcc || mapped.length } as T
  }

  // Con comunidad -> endpoint directo
  const endpoint = `/api/v1/incidents/community/${encodeURIComponent(String(cid))}`

  const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: endpoint,
    method: 'get',
    params: qp,
  })

  const { items, total } = pickItemsAndTotal(body)
  const list: IncidentRow[] = items.map(mapIncidentRow)
  return { list, total } as T
}

/**
 * Tu API no expone GET /api/v1/incidents/{id}.
 * Recorremos comunidades del usuario (memoizadas) y devolvemos el que matchee.
 */
export async function apiFindIncidentByIdAcrossCommunities(
  id: string | number
): Promise<IncidentRow | null> {
  const target = String(id)
  const ids = await getAllCommunityIds()
  if (!ids.length) return null

  const innerParams = { pageIndex: 1, pageSize: 1000 }

  for (const cid of ids) {
    try {
      const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
        url: `/api/v1/incidents/community/${encodeURIComponent(String(cid))}`,
        method: 'get',
        params: innerParams,
      })
      const { items } = pickItemsAndTotal(body)
      for (const it of items) {
        const row = mapIncidentRow(it)
        if (String(row.id) === target) {
          return row
        }
      }
    } catch {
      // continuar con la siguiente comunidad
    }
  }

  return null
}

/** Legacy (tu backend devuelve 405) */
export async function apiGetIncidentById(id: string | number) {
  const cleanId = trimSlashes(String(id))
  const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/incidents/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return mapIncidentRow(body)
}

export async function apiGetIncidentUpdates(id: string | number): Promise<GetIncidentUpdatesResponse> {
  const cleanId = trimSlashes(String(id))
  const body = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/incidents/${encodeURIComponent(cleanId)}/updates`,
    method: 'get',
  })

  const { items, total } = pickItemsAndTotal(body)
  const list: IncidentUpdateRow[] = items.map((u) => {
    const o = isObject(u) ? u : {}
    const uid =
      get(o, 'id') ??
      get(o, 'update_id') ??
      get(o, '_id') ??
      ''
    const idStr = toStr(uid) ?? ''
    const mappedId = idStr !== '' ? trimSlashes(idStr) : String(uid ?? '')
    const createdAt =
      toStr(get(o, 'created_at')) ??
      toStr(get(o, 'createdAt')) ??
      toStr(get(o, 'date')) ??
      new Date().toISOString()
    const author =
      toStr(get(o, 'author_name')) ??
      toStr(get(o, 'author')) ??
      toStr(get(o, 'user_name')) ??
      undefined
    const text =
      toStr(get(o, 'text')) ??
      toStr(get(o, 'message')) ??
      toStr(get(o, 'content')) ??
      ''

    const mapped: IncidentUpdateRow = {
      id: mappedId,
      created_at: createdAt,
      text,
    }
    if (author !== undefined) mapped.author_name = author
    return mapped
  })

  return { list, total }
}

export async function apiPatchIncidentStatus(
  id: string | number,
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
) {
  const cleanId = trimSlashes(String(id))
  return ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/incidents/${encodeURIComponent(cleanId)}/status`,
    method: 'patch',
    data: { status },
  })
}

const IncidentsApi = {
  apiGetIncidentsList,
  apiFindIncidentByIdAcrossCommunities,
  apiGetIncidentById, // legacy
  apiGetIncidentUpdates,
  apiPatchIncidentStatus,
}

export default IncidentsApi
