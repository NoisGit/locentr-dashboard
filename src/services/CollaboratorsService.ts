import ApiService from '@/services/ApiService'

/* ====================== Tipos ====================== */
export type CollaboratorTableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: number | string | ''
  viewerRole?: 'SUPERADMIN' | 'ADMIN' | 'SUBADMIN' | undefined
}

export type CollaboratorRow = {
  id: string | number
  name: string
  email?: string
  phone?: string
  role?: string
  community?: string
  active?: boolean
}

export type GetCollaboratorsListResponse = {
  list: CollaboratorRow[]
  total: number
}

export type CollaboratorUpdateInput = {
  name?: string
  email?: string
  phone?: string
  password?: string
  role?: string
  communityId?: number | string | null | ''
  active?: boolean
}

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
        : isRec(r.data) && typeof (r.data as Rec).total === 'number'
        ? Number((r.data as Rec).total)
        : undefined
    return { items, total }
  }
  return { items: Array.isArray(raw) ? (raw as unknown[]) : [], total: undefined }
}

/* ---- roles ---- */
function normalizeUserRoleName(v: unknown): 'SUPERADMIN' | 'ADMIN' | 'SUBADMIN' | 'CONCIERGE' | 'GUARD' | '' {
  const raw = typeof v === 'string' ? v : ''
  const n = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z]/gi, '').toUpperCase()
  if (n === 'SUPERADMIN' || n === 'SUPER_ADMIN' || n === 'SUPERADMINISTRADOR') return 'SUPERADMIN'
  if (n === 'ADMIN' || n === 'ADMINISTRATOR' || n === 'ADMINISTRADOR') return 'ADMIN'
  if (n === 'SUBADMIN' || n === 'SUB_ADMIN' || n === 'SUBADMINISTRADOR') return 'SUBADMIN'
  if (n === 'CONCIERGE' || n === 'CONSERJE') return 'CONCIERGE'
  if (n === 'GUARD' || n === 'GUARDIA' || n === 'SECURITY' || n === 'SEGURIDAD' || n === 'VIGILANTE') return 'GUARD'
  return ''
}
function roleNameOf(u: Rec): string {
  const direct = u.role
  if (typeof direct === 'string') return direct
  if (isRec(direct) && typeof (direct as Rec).name === 'string') return String((direct as Rec).name)
  if (typeof u.role_name === 'string') return u.role_name
  const roles = (u as Rec).roles
  if (Array.isArray(roles)) {
    for (const rr of roles) {
      if (isRec(rr) && typeof (rr as Rec).name === 'string') return String((rr as Rec).name)
      if (typeof rr === 'string') return rr
    }
  }
  return ''
}
function normalizeViewerRole(v: unknown): 'SUPERADMIN' | 'ADMIN' | 'SUBADMIN' | '' {
  const raw = typeof v === 'string' ? v : ''
  const n = raw.replace(/[^a-z]/gi, '').toUpperCase()
  if (n === 'SUPERADMIN' || n === 'SUPER_ADMIN') return 'SUPERADMIN'
  if (n === 'ADMIN') return 'ADMIN'
  if (n === 'SUBADMIN' || n === 'SUB_ADMIN') return 'SUBADMIN'
  return ''
}

/* ---- comunidad (solo para nombre) ---- */
const communityNameCache = new Map<string, string>()
async function fetchCommunityName(communityId: number | string): Promise<string | undefined> {
  const key = String(communityId)
  if (communityNameCache.has(key)) return communityNameCache.get(key)
  try {
    const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
      url: `/api/v1/communities/id/${encodeURIComponent(key)}`,
      method: 'get',
    })
    const r = isRec(raw) ? (raw as Rec) : {}
    const name = s(r.name) || s(r.title) || s((r as Rec).community_name)
    if (name) communityNameCache.set(key, name)
    return name || undefined
  } catch {
    return undefined
  }
}

/* ---- roles map (desde /api/v1/roles/) ---- */
const rolesCache = { ts: 0, map: new Map<'SUPERADMIN'|'ADMIN'|'SUBADMIN'|'CONCIERGE'|'GUARD', number|string>() }
async function fetchRolesMap() {
  const TTL = 60_000
  if (Date.now() - rolesCache.ts < TTL && rolesCache.map.size) return rolesCache.map
  try {
    const raw = await ApiService.fetchDataWithAxios<unknown>({ url: '/api/v1/roles/', method: 'get' })
    const { items } = extractList(raw)
    const map = new Map<'SUPERADMIN'|'ADMIN'|'SUBADMIN'|'CONCIERGE'|'GUARD', number|string>()
    for (const it of items) {
      const r = isRec(it) ? (it as Rec) : {}
      const id = (r.id as number | string | undefined)
      const name = normalizeUserRoleName(r.name)
      if (id != null && name) {
        if (!map.has(name as any)) map.set(name as any, id)
        if (name === 'GUARD' && !map.has('GUARD')) map.set('GUARD', id)
      }
    }
    rolesCache.ts = Date.now()
    rolesCache.map = map
  } catch { /* noop */ }
  return rolesCache.map
}

/* ---- helpers comunidad ---- */
function hasAnyCommunityField(u: Rec): boolean {
  if ((u as Rec).community_id != null) return true
  const c = (u as Rec).community
  if (isRec(c) && ((c as Rec).id != null || (c as Rec).community_id != null)) return true
  const cs = (u as Rec).communities
  return Array.isArray(cs) && cs.length > 0
}
function inCommunity(u: Rec, communityId: number | string): boolean {
  const cid = String(communityId)
  const direct = (u as Rec).community_id
  if (direct != null && String(direct) === cid) return true
  const c = (u as Rec).community
  if (isRec(c)) {
    const cId = (c as Rec).id ?? (c as Rec).community_id
    if (cId != null && String(cId) === cid) return true
  }
  const cs = (u as Rec).communities
  if (Array.isArray(cs)) {
    return cs.some((x) => isRec(x)
      ? String((x as Rec).id ?? (x as Rec).community_id) === cid
      : String(x) === cid)
  }
  return false
}

/* ---- map a fila ---- */
function mapRow(u: unknown, forcedCommunityName?: string): CollaboratorRow {
  const r = isRec(u) ? u : {}
  const id = (r as Rec).id ?? (r as Rec)._id ?? (r as Rec).user_id ?? (r as Rec).uid ?? ''
  const first = s((r as Rec).first_name)
  const last  = s((r as Rec).last_name)
  const full  = s((r as Rec).full_name) || s((r as Rec).name) || [first, last].filter(Boolean).join(' ')
  const phone = s((r as Rec).phone || (r as Rec).phone_number)
  const active =
    Boolean((r as Rec).is_active ?? (r as Rec).active) ||
    (isRec((r as Rec).meta) && Boolean(((r as Rec).meta as Rec).active))
  const canonical = normalizeUserRoleName(roleNameOf(r))

  // SUPERADMIN siempre muestra comunidad '-------'
  const communityName = canonical === 'SUPERADMIN' ? '-------' : (forcedCommunityName || undefined)

  return {
    id: s(id),
    name: full || s((r as Rec).email) || `ID ${s(id)}`,
    email: s((r as Rec).email) || undefined,
    phone: phone || undefined,
    role: canonical || undefined,
    community: communityName,
    active,
  }
}

/* ====================== GET by ID (robusto) ====================== */
export async function apiGetCollaboratorById<T = CollaboratorRow>(id: string | number): Promise<T> {
  const sid = String(id)

  // 1) Intento por rutas directas
  const directUrls = [
    `/api/v1/users/${encodeURIComponent(sid)}`,
    `/api/v1/users/id/${encodeURIComponent(sid)}`,
  ]
  for (const url of directUrls) {
    try {
      const raw = await ApiService.fetchDataWithAxios<unknown>({ url, method: 'get' })
      const obj = isRec(raw) && isRec((raw as Rec).data) ? ((raw as Rec).data as Rec) : (raw as Rec)
      const mapped = mapRow(obj)
      if (mapped && mapped.id) return mapped as unknown as T
    } catch { /* probar siguientes opciones */ }
  }

  // 2) Intento por listado con filtros típicos
  const tryParams: Record<string, unknown>[] = [
    { id: sid },
    { user_id: sid },
    { uid: sid },
    { 'filters[id]': sid },
    { 'filters[user_id]': sid },
    { 'filters[uid]': sid },
  ]
  for (const params of tryParams) {
    try {
      const raw = await ApiService.fetchDataWithAxios<unknown>({
        url: '/api/v1/users/',
        method: 'get',
        params: {
          ...params,
          limit: 1,
          pageIndex: 1,
          pageSize: 1,
          include: ['community', 'communities', 'role', 'roles'],
          'include[]': ['community', 'communities', 'role', 'roles'],
          expand: 'community,communities,role,roles',
          with: 'community,communities,role,roles',
        },
      })
      const { items } = extractList(raw)
      if (Array.isArray(items) && items.length) {
        return mapRow(items[0]) as unknown as T
      }
    } catch { /* probar siguiente */ }
  }

  // 3) Último recurso: devolver estructura mínima
  return { id: sid, name: '' } as unknown as T
}

/* ====================== Listar ====================== */
export async function apiGetCollaboratorsList<T = GetCollaboratorsListResponse>(
  params: CollaboratorTableQueries,
): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize  = Math.max(1, Number(params.pageSize ?? 10))
  const need      = pageIndex * pageSize
  const limit     = Math.max(need, 100)

  const viewer = normalizeViewerRole(params.viewerRole)

  const baseRolesCanon = ['ADMIN','SUBADMIN','CONCIERGE','GUARD'] as const
  const allRolesCanon  = ['SUPERADMIN', ...baseRolesCanon] as const
  const canonWanted    = viewer === 'SUPERADMIN' ? allRolesCanon : baseRolesCanon

  const rolesMap = await fetchRolesMap()
  const roleIdsWanted: (number|string)[] = []
  for (const k of canonWanted) {
    const id = rolesMap.get(k as any)
    if (id != null) roleIdsWanted.push(id)
  }

  const qp: Record<string, unknown> = {
    skip: 0,
    limit,
    pageIndex,
    pageSize,
    roles_in: canonWanted,
    'roles_in[]': canonWanted,
  }
  if (roleIdsWanted.length) {
    qp['role_ids[]'] = roleIdsWanted
    qp.role_ids = roleIdsWanted
  }

  const q = (params.query ?? '').toString().trim()
  if (q) qp.query = q

  const srt = params.sort
  if (srt?.key)   qp['sort[key]']   = srt.key
  if (srt?.order) qp['sort[order]'] = srt.order
  if (!srt) {
    qp['sort[key]'] = 'id'
    qp['sort[order]'] = 'desc'
  }

  const hasCid =
    params.communityId !== '' &&
    params.communityId != null &&
    !Number.isNaN(Number(params.communityId))

  let forcedCommunityName: string | undefined
  if (hasCid) {
    const cid = Number(params.communityId)
    qp.community_id = cid
    qp.communityId = cid
    qp['filters[community_id]'] = cid
    qp.community = cid
    forcedCommunityName = await fetchCommunityName(cid)
  }
  qp.include = ['community','communities']
  qp['include[]'] = ['community','communities']
  qp.expand = 'community,communities'
  qp.with = 'community,communities'

  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: '/api/v1/users/',
    method: 'get',
    params: qp,
  })
  const { items } = extractList(raw)

  const byRole = (items as unknown[]).filter((u) => {
    const canonical = normalizeUserRoleName(roleNameOf(isRec(u) ? (u as Rec) : {}))
    if (viewer === 'SUPERADMIN') return ['SUPERADMIN','ADMIN','SUBADMIN','CONCIERGE','GUARD'].includes(canonical)
    return ['ADMIN','SUBADMIN','CONCIERGE','GUARD'].includes(canonical)
  })

  const anyHasCommunity = byRole.some((u) => hasAnyCommunityField(isRec(u) ? (u as Rec) : {}))

  const byCommunity = hasCid
    ? byRole.filter((u) => {
        const r = isRec(u) ? (u as Rec) : {}
        const canonical = normalizeUserRoleName(roleNameOf(r))
        if (viewer === 'SUPERADMIN' && canonical === 'SUPERADMIN') return true
        if (!anyHasCommunity) return true
        return inCommunity(r, Number(params.communityId))
      })
    : byRole

  const searched = q
    ? byCommunity.filter((u) => {
        const r = isRec(u) ? (u as Rec) : {}
        const name  = s(r.full_name) || s(r.name)
        const email = s(r.email)
        return [name, email].some((t) => t.toLowerCase().includes(q.toLowerCase()))
      })
    : byCommunity

  const mappedAll = searched.map((u) => {
    const r = isRec(u) ? (u as Rec) : {}
    const role = normalizeUserRoleName(roleNameOf(r))
    const forced = role === 'SUPERADMIN' ? '-------' : (hasCid ? (forcedCommunityName || undefined) : undefined)
    return mapRow(u, forced)
  })

  const start = (pageIndex - 1) * pageSize
  const end   = start + pageSize
  const pageSlice = mappedAll.slice(start, end)
  const total = mappedAll.length

  return { list: pageSlice, total } as T
}

/* ====================== Eliminar / Editar ====================== */
export async function apiDeleteCollaborator(id: string | number): Promise<void> {
  await ApiService.fetchDataWithAxios({ url: `/api/v1/users/${id}`, method: 'delete' })
}

export async function apiUpdateCollaborator(
  id: string | number,
  data: CollaboratorUpdateInput,
): Promise<CollaboratorRow> {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) {
    payload.name = data.name
    payload.full_name = data.name
  }
  if (data.email !== undefined) payload.email = data.email
  if (data.phone !== undefined) {
    payload.phone = data.phone
    payload.phone_number = data.phone
  }
  if (data.password !== undefined && String(data.password).trim() !== '') {
    payload.password = data.password
  }
  if (data.role !== undefined) payload.role = data.role
  if (data.active !== undefined) payload.active = data.active
  if (data.communityId !== undefined) {
    payload.community_id = data.communityId === null || data.communityId === '' ? null : Number(data.communityId)
  }

  const raw = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
    url: `/api/v1/users/${id}`,
    method: 'put', // solo PUT para evitar 405 en rojo
    data: payload,
  })

  if (raw && isRec(raw)) {
    const maybeUser = (raw as Rec).data && isRec((raw as Rec).data)
      ? ((raw as Rec).data as Rec)
      : (raw as Rec)
    return mapRow(maybeUser)
  }

  return {
    id: String(id),
    name: (data.name as string) ?? `ID ${String(id)}`,
    email: data.email ?? undefined,
    phone: data.phone ?? undefined,
    role: data.role ?? undefined,
    community:
      data.communityId === null || data.communityId === '' || data.communityId === undefined
        ? undefined
        : String(data.communityId),
    active: data.active ?? true,
  }
}

const CollaboratorsService = {
  apiGetCollaboratorById,
  apiGetCollaboratorsList,
  apiDeleteCollaborator,
  apiUpdateCollaborator,
}
export default CollaboratorsService
