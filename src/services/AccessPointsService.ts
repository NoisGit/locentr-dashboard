import ApiService from '@/services/ApiService'

/* ====================== Tipos ====================== */
export type AccessPointTableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: number | string | ''
}

export type AccessPointRow = {
  id: string | number
  /** Nombre visible (prioriza full_name) */
  name: string
  /** Nombre crudo del JSON (si viene) */
  full_name?: string
  /** Email informativo (solo lectura en UI) */
  email?: string
  role?: string
  community?: string
  location?: string
  active?: boolean
}

export type GetAccessPointsListResponse = {
  list: AccessPointRow[]
  total: number
}

/* ===== Aliases p/ compatibilidad con código previo (si existiera) ===== */
export type HardwareRow = AccessPointRow
export type GetHardwareListResponse = GetAccessPointsListResponse

/* ====================== Utils ====================== */
type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null
const s = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''

function extractList(raw: unknown): { items: unknown[]; total?: number } {
  if (isRec(raw)) {
    const r = raw as Rec
    const candidates = [r.list, r.items, r.results, r.data, raw]
    let items: unknown[] = []
    for (const c of candidates) {
      if (Array.isArray(c)) { items = c; break }
      if (isRec(c)) {
        const nested = (c as Rec).list ?? (c as Rec).items ?? (c as Rec).results
        if (Array.isArray(nested)) { items = nested; break }
      }
    }
    const total =
      typeof r.total === 'number'
        ? r.total
        : isRec(r.data) && typeof ((r.data as Rec).total) === 'number'
        ? Number((r.data as Rec).total)
        : undefined
    return { items, total }
  }
  return { items: Array.isArray(raw) ? (raw as unknown[]) : [], total: undefined }
}

function pickCommunityName(u: Rec): string {
  const direct = s(u.community_name)
  if (direct) return direct

  const community = (u as Rec).community
  if (isRec(community)) {
    const n =
      s((community as Rec).name) ||
      s((community as Rec).title) ||
      s((community as Rec).label)
    if (n) return n
  } else if (typeof community === 'string') {
    return community
  }

  const cid = (u as Rec).community_id
  if (cid != null && s(cid)) return `Comunidad #${s(cid)}`
  return ''
}

function pickRoleName(u: Rec): string {
  // Devuelve TAL CUAL venga del backend.
  const role = u.role
  const roleName =
    typeof role === 'string'
      ? role
      : isRec(role) && typeof (role as Rec).name === 'string'
      ? String((role as Rec).name)
      : undefined

  const typeName =
    typeof u.type === 'string' ? u.type :
    (isRec(u.type) && typeof (u.type as Rec).name === 'string') ? String((u.type as Rec).name) :
    undefined

  const category =
    typeof u.category === 'string' ? u.category :
    (isRec(u.category) && typeof (u.category as Rec).name === 'string') ? String((u.category as Rec).name) :
    undefined

  return roleName || typeName || category || ''
}

function pickLocation(u: Rec): string {
  return (
    s(u.location) ||
    s((u as Rec).place) ||
    s((u as Rec).position) ||
    ''
  )
}

function isActiveFlag(u: Rec): boolean {
  const status = s((u as Rec).status).toUpperCase()
  if (status) return status === 'ACTIVE' || status === 'ENABLED' || status === 'ACTIVO'
  const enabled = (u as Rec).enabled
  if (typeof enabled === 'boolean') return enabled
  const active = (u as Rec).active ?? (u as Rec).is_active
  return Boolean(active)
}

/* ---- map a fila ---- */
function mapRow(u: unknown): AccessPointRow {
  const r = isRec(u) ? u : {}
  const id =
    (r as Rec).id ??
    (r as Rec)._id ??
    (r as Rec).hardware_id ??
    (r as Rec).device_id ??
    ''

  const full = s((r as Rec).full_name)
  const fallbackName =
    s((r as Rec).name) ||
    s((r as Rec).device_name) ||
    s((r as Rec).label) ||
    s((r as Rec).alias) ||
    (id ? `Hardware #${s(id)}` : '')

  const name = full || fallbackName || `ID ${s(id)}`

  const email =
    s((r as Rec).email) ||
    (isRec((r as Rec).user) ? s(((r as Rec).user as Rec).email) : '')

  return {
    id: s(id),
    name,                        // 👈 prioriza full_name
    full_name: full || undefined,
    email: email || undefined,   // 👈 expuesto para el Edit (solo lectura)
    role: pickRoleName(r) || undefined,
    community: pickCommunityName(r) || undefined,
    location: pickLocation(r) || undefined,
    active: isActiveFlag(r),
  }
}

/* --- helper para notificar cambios y refrescar listas abiertas --- */
function notifyAccessPointsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('accesspoints:changed'))
  }
}

/* ====================== GET by ID (corrige 404 usando /users/:id) ====================== */
export async function apiGetAccessPointById<T = AccessPointRow>(id: string | number): Promise<T> {
  const sid = String(id)

  const directUrls = [
    `/api/v1/users/${encodeURIComponent(sid)}`,        // ← primero usuarios (tiene full_name, email, role)
    `/api/v1/hardware/${encodeURIComponent(sid)}`,
    `/api/v1/hardware/id/${encodeURIComponent(sid)}`,
    `/api/v1/devices/${encodeURIComponent(sid)}`,
  ]

  for (const url of directUrls) {
    try {
      const raw = await ApiService.fetchDataWithAxios<unknown>({ url, method: 'get' })
      const obj = isRec(raw) && isRec((raw as Rec).data) ? ((raw as Rec).data as Rec) : (raw as Rec)
      const mapped = mapRow(obj)
      if (mapped && mapped.id) return mapped as unknown as T
    } catch { /* probar siguiente variante */ }
  }

  // Fallback minimal
  return { id: sid, name: `ID ${sid}` } as unknown as T
}

/* ====================== Listar por comunidad ====================== */
export async function apiGetAccessPointsList<T = GetAccessPointsListResponse>(
  params: AccessPointTableQueries,
): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize  = Math.max(1, Number(params.pageSize ?? 10))

  const hasCid =
    params.communityId !== '' &&
    params.communityId != null &&
    !Number.isNaN(Number(params.communityId))

  if (!hasCid) {
    return { list: [], total: 0 } as T
  }
  const cid = Number(params.communityId)

  const q = (params.query ?? '').toString().trim()
  const srt = params.sort

  const qp: Record<string, unknown> = { pageIndex, pageSize }
  if (q) qp.query = q
  if (srt?.key)   qp['sort[key]']   = srt.key
  if (srt?.order) qp['sort[order]'] = srt.order
  if (!srt) { qp['sort[key]'] = 'id'; qp['sort[order]'] = 'desc' }

  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/communities/${encodeURIComponent(String(cid))}/hardware`,
    method: 'get',
    params: qp,
  })

  const { items, total: serverTotal } = extractList(raw)

  // Map
  let mapped = (items as unknown[]).map((u) => mapRow(u))

  // Fallback de búsqueda local si el backend no filtra por query
  if (q) {
    const qq = q.toLowerCase()
    mapped = mapped.filter((r) =>
      (r.name ?? '').toLowerCase().includes(qq) ||
      (r.full_name ?? '').toLowerCase().includes(qq) ||
      (r.role ?? '').toLowerCase().includes(qq) ||
      (r.location ?? '').toLowerCase().includes(qq) ||
      (r.community ?? '').toLowerCase().includes(qq) ||
      String(r.id).toLowerCase().includes(qq),
    )
  }

  // Fallback de orden local si el backend no ordena
  if (srt?.key === 'name') {
    mapped = mapped.slice().sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' })
    )
    if (srt.order === 'desc') mapped.reverse()
  } else if (srt?.key === 'role') {
    mapped = mapped.slice().sort((a, b) =>
      (a.role ?? '').localeCompare(b.role ?? '', undefined, { sensitivity: 'base' })
    )
    if (srt.order === 'desc') mapped.reverse()
  }

  // Fallback de paginación local
  const total = typeof serverTotal === 'number' ? serverTotal : mapped.length
  const start = (pageIndex - 1) * pageSize
  const end   = start + pageSize
  const pageSlice = mapped.slice(start, end)

  return { list: pageSlice, total: Number(total ?? mapped.length) } as T
}

/* ====================== Eliminar / Editar (incluye /users/:id) ====================== */
export async function apiDeleteAccessPoint(id: string | number): Promise<void> {
  const urls = [
    `/api/v1/users/${encodeURIComponent(String(id))}`,     // si fuese un “user hardware”
    `/api/v1/hardware/${encodeURIComponent(String(id))}`,
    `/api/v1/devices/${encodeURIComponent(String(id))}`,
  ]
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      await ApiService.fetchDataWithAxios({ url, method: 'delete' })
      notifyAccessPointsChanged()
      return
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr ?? new Error('No se pudo eliminar el Access Point')
}

export type AccessPointUpdateInput = {
  name?: string
  location?: string
  active?: boolean
  // otros campos reales si el backend los acepta (model, serial, etc.)
}

export async function apiUpdateAccessPoint(
  id: string | number,
  data: AccessPointUpdateInput,
): Promise<AccessPointRow> {
  // Armamos payload flexible: para /users mandamos full_name si cambió name
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) { payload.name = data.name; payload.full_name = data.name }
  if (data.location !== undefined) payload.location = data.location
  if (data.active !== undefined) payload.active = data.active

  const urls = [
    `/api/v1/users/${encodeURIComponent(String(id))}`,     // ← primero usuarios
    `/api/v1/hardware/${encodeURIComponent(String(id))}`,
    `/api/v1/devices/${encodeURIComponent(String(id))}`,
  ]

  let lastErr: unknown = null
  for (const url of urls) {
    try {
      const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
        url,
        method: 'put',
        data: payload,
      })
      const mapped = (raw && isRec(raw))
        ? mapRow(isRec((raw as Rec).data) ? ((raw as Rec).data as Rec) : (raw as Rec))
        : { id: String(id), name: (data.name as string) ?? `ID ${String(id)}`, location: data.location, active: data.active }
      notifyAccessPointsChanged()
      return mapped
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr ?? new Error('No se pudo actualizar el Access Point')
}

/* ====================== Export por defecto ====================== */
const AccessPointsService = {
  apiGetAccessPointsList,
  apiGetAccessPointById,
  apiDeleteAccessPoint,
  apiUpdateAccessPoint,
  // aliases
  apiGetHardwareUsers: apiGetAccessPointsList,
}
export default AccessPointsService
