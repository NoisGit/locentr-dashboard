import ApiService from '@/services/ApiService'

export type AccessPointTableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
  communityId?: number | string | ''
}

export type HardwareRow = {
  id: string | number
  name: string
  role?: string
  community?: string
  location?: string
  active?: boolean
}

export type GetHardwareListResponse = {
  list: HardwareRow[]
  total: number
}

type Rec = Record<string, unknown>
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null
const s = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''

function readItemsAndTotal(raw: unknown): { items: unknown[]; total: number; hasNext?: boolean } {
  const r = isRec(raw) ? raw : {}
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
    typeof (r as Rec).total === 'number'
      ? Number((r as Rec).total)
      : isRec((r as Rec).data) && typeof ((r as Rec).data as Rec).total === 'number'
      ? Number(((r as Rec).data as Rec).total)
      : items.length

  const hasNext =
    typeof (r as Rec).has_next === 'boolean'
      ? ((r as Rec).has_next as boolean)
      : isRec((r as Rec).pagination) && typeof ((r as Rec).pagination as Rec).has_next === 'boolean'
      ? Boolean(((r as Rec).pagination as Rec).has_next)
      : undefined

  return { items, total, hasNext }
}

/** rol en distintos formatos -> string */
function pickRoleName(u: Rec): string {
  const role = u.role
  const roleName =
    typeof role === 'string'
      ? role
      : isRec(role) && typeof (role as Rec).name === 'string'
      ? String((role as Rec).name)
      : undefined
  const role_name = typeof u.role_name === 'string' ? (u.role_name as string) : undefined

  if (roleName) return roleName
  if (role_name) return role_name

  // roles: [] (tomamos el primero legible)
  const roles = u.roles
  if (Array.isArray(roles)) {
    for (const rr of roles) {
      if (isRec(rr) && typeof (rr as Rec).name === 'string') return String((rr as Rec).name)
      if (typeof rr === 'string') return rr
    }
  }
  return ''
}

/** comunidad en distintos formatos -> string */
function pickCommunityName(u: Rec): string {
  const direct = s((u as Rec).community_name)
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

/** Detecta si el usuario tiene rol "hardware" */
function isHardware(u: unknown): boolean {
  const r = isRec(u) ? (u as Rec) : {}

  const roleId = r.role_id
  if (roleId === 7 || roleId === '7') return true

  const roleName = pickRoleName(r).trim().toLowerCase()
  if (roleName === 'hardware') return true

  const roles = r.roles
  if (Array.isArray(roles)) {
    for (const rr of roles) {
      if (isRec(rr)) {
        const rid = (rr as Rec).id
        const rn  = (rr as Rec).name
        if (rid === 7 || rid === '7') return true
        if (typeof rn === 'string' && rn.trim().toLowerCase() === 'hardware') return true
      } else {
        if (rr === 7 || rr === '7' || String(rr).trim().toLowerCase() === 'hardware') return true
      }
    }
  }

  return false
}

/** Mapea a la fila que mostramos */
function mapRow(u: unknown): HardwareRow {
  const r = isRec(u) ? u : {}
  const id = r.id ?? (r as Rec)._id ?? ''
  const first = s((r as Rec).first_name)
  const last  = s((r as Rec).last_name)
  const full  = s((r as Rec).full_name) || s((r as Rec).name) || [first, last].filter(Boolean).join(' ')
  return {
    id: s(id),
    name: full || s((r as Rec).email) || `ID ${s(id)}`,
    role: pickRoleName(r) || '—',
    community: pickCommunityName(r) || '—',
    location: s((r as Rec).location),
    active: Boolean((r as Rec).is_active ?? (r as Rec).active),
  }
}

/**
 * Trae TODOS los usuarios en bloques de 100 (skip/limit) y filtra a "hardware".
 * Luego pagina en cliente según pageIndex/pageSize (10/25/50/100).
 */
export async function apiGetHardwareUsers<T = GetHardwareListResponse>(
  params: AccessPointTableQueries,
): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize  = Math.max(1, Number(params.pageSize ?? 10))
  const BULK = 100

  const base: Record<string, unknown> = {
    role_id: 7,
    role: 'HARDWARE',
  }
  const q = (params.query ?? '').toString().trim()
  if (q) base.query = q
  if (params.communityId !== '' && params.communityId != null) {
    base.community_id = Number(params.communityId)
  }
  if (params.sort?.key)   base['sort[key]'] = params.sort.key
  if (params.sort?.order) base['sort[order]'] = params.sort.order
  if (!params.sort) {
    base['sort[key]'] = 'id'
    base['sort[order]'] = 'desc'
  }

  let offset = 0
  const all: unknown[] = []
  const MAX_LOOPS = 200

  for (let i = 0; i < MAX_LOOPS; i += 1) {
    const resp = await ApiService.fetchDataWithAxios<unknown, Record<string, unknown>>({
      url: '/api/v1/users/',
      method: 'get',
      params: { ...base, skip: offset, limit: BULK, pageIndex: 1, pageSize: BULK },
    })
    const { items, hasNext } = readItemsAndTotal(resp)
    all.push(...items)
    if (!items.length || items.length < BULK || hasNext === false) break
    offset += BULK
  }

  const filtered = all.filter(isHardware)
  const total = filtered.length
  const start = (pageIndex - 1) * pageSize
  const sliced = filtered.slice(start, start + pageSize)

  const list = sliced.map(mapRow)
  return { list, total: Number(total) } as T
}

const AccessPointsService = { apiGetHardwareUsers }
export default AccessPointsService
