// src/services/UserService.ts
import ApiService from '@/services/ApiService'
import type { AxiosRequestConfig } from 'axios'

export type RoleRef = { id?: number | string; name?: string }

export type UserRow = {
  id: number | string
  full_name?: string
  name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  role_id?: number | string
  role?: RoleRef | string
  created_at?: string
}

export type ListParams = {
  pageIndex?: number
  pageSize?: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

export type ListResult = {
  items: UserRow[]
  total: number
}

export function userDisplayName(u: UserRow) {
  const nameParts = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return u.full_name || u.name || nameParts || ''
}

const BASE_COLLECTION = '/api/v1/users/'
const BASE_ITEM = '/api/v1/users'

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ReqConfig = {
  url: string
  method: HttpMethod
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
}

type Dict = Record<string, unknown>
type RoleLike = { id?: number | string; name?: string }
type UserLike = {
  id?: number | string
  _id?: number | string
  user_id?: number | string
  uid?: number | string
  first_name?: string
  last_name?: string
  full_name?: string
  name?: string
  email?: string
  phone?: string
  phone_number?: string
  role?: string | RoleLike
  role_name?: string
  avatar?: string
  avatar_url?: string
  photoURL?: string
  photo_url?: string
}

function isRecord(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}

async function req<T>(cfg: ReqConfig): Promise<T> {
  const resp = await ApiService.fetchDataWithAxios<T, Record<string, unknown>>(
    cfg as unknown as AxiosRequestConfig<Record<string, unknown>>,
  )
  return resp
}

function extractList(d: unknown): { items: unknown[]; total: number } {
  let items: unknown[] = []
  let total = 0
  if (isRecord(d)) {
    if (Array.isArray((d as Dict).items)) items = (d as Dict).items as unknown[]
    else if (isRecord((d as Dict).data) && Array.isArray(((d as Dict).data as Dict).items))
      items = (((d as Dict).data as Dict).items as unknown[]) ?? []
    else if (Array.isArray((d as Dict).list)) items = (d as Dict).list as unknown[]
    else if (Array.isArray((d as Dict).data)) items = (d as Dict).data as unknown[]
    else if (Array.isArray((d as Dict).results)) items = (d as Dict).results as unknown[]
    else if (Array.isArray(d)) items = d as unknown[]
    const cand =
      (d as Dict).total ??
      (d as Dict).count ??
      (isRecord((d as Dict).pagination) ? ((d as Dict).pagination as Dict).total : undefined) ??
      (isRecord((d as Dict).data) ? ((d as Dict).data as Dict).total : undefined) ??
      (isRecord((d as Dict).data) ? ((d as Dict).data as Dict).count : undefined)
    total = Number(typeof cand === 'number' || typeof cand === 'string' ? cand : items.length)
  } else if (Array.isArray(d)) {
    items = d as unknown[]
    total = items.length
  }
  return { items, total }
}

function roleString(u: UserRow): string {
  if (typeof u.role === 'string') return u.role
  if (u.role && typeof u.role.name === 'string') return u.role.name
  return ''
}

export function isAdminOrSuper(u: UserRow): 'ADMIN' | 'SUPERADMIN' | null {
  const r = roleString(u).trim().toLowerCase()
  if (!r) return null
  if (r.includes('super') && r.includes('admin')) return 'SUPERADMIN'
  if (r.includes('admin') && !r.includes('sub')) return 'ADMIN'
  if (r === 'administrator' || r === 'administrador') return 'ADMIN'
  if (r === 'super administrator' || r === 'super administrador') return 'SUPERADMIN'
  return null
}

export async function apiListUsers(params: ListParams = {}): Promise<ListResult> {
  const queryParams: Record<string, unknown> = {}
  if (params.pageIndex != null) queryParams.pageIndex = params.pageIndex
  if (params.pageSize != null) queryParams.pageSize = params.pageSize
  if (params.query != null) queryParams.query = params.query
  if (params.sort?.key) queryParams['sort[key]'] = params.sort.key
  if (params.sort?.order) queryParams['sort[order]'] = params.sort.order
  const d = await req<unknown>({ url: BASE_COLLECTION, method: 'get', params: queryParams })
  const { items, total } = extractList(d)
  return { items: items as UserRow[], total }
}

export async function apiListAdmins(params: ListParams = {}): Promise<ListResult> {
  const res = await apiListUsers(params)
  const items = (res.items as UserRow[]).filter((u) => isAdminOrSuper(u) !== null)
  return { items, total: items.length }
}

export async function apiGetUserById(id: number | string) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`
  try {
    const d = await req<UserRow>({ url, method: 'get' })
    return d
  } catch (e: unknown) {
    try {
      const d2 = await req<UserRow>({ url: `${url}/`, method: 'get' })
      return d2
    } catch {
      const d3 = await req<unknown>({
        url: BASE_COLLECTION,
        method: 'get',
        params: { pageIndex: 1, pageSize: 50, query: String(cleanId) },
      })
      const { items } = extractList(d3)
      const found =
        (items as UserLike[]).find((u) => String(u.id ?? u._id) === cleanId) ??
        (items as UserLike[]).find((u) => String(u.user_id ?? u.uid) === cleanId) ??
        null
      if (!found) throw e
      return found as UserRow
    }
  }
}

export async function apiCreateUser(payload: {
  full_name: string
  phone: string
  email: string
  password: string
  role_id: number
}) {
  const d = await req<unknown>({ url: BASE_COLLECTION, method: 'post', data: payload })
  return d
}

export async function apiUpdateUser(
  id: number | string,
  payload: Partial<{
    full_name: string
    phone: string
    email: string
    password: string
    role_id: number
  }>,
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`
  const d = await req<unknown>({ url, method: 'put', data: payload })
  return d
}

export async function apiDeleteUser(id: number | string) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`
  const d = await req<unknown>({ url, method: 'delete' })
  return d
}

export async function apiGetMe() {
  const d = await req<UserRow>({ url: `${BASE_ITEM}/me`, method: 'get' })
  return d
}

export function normalizeUser(u: UserRow | undefined | null) {
  const v = (u ?? ({} as UserRow)) as UserRow
  const roleName = (typeof v.role === 'string' ? v.role : v.role?.name) || undefined
  return {
    id: v.id,
    userName: userDisplayName(v),
    email: v.email ?? '',
    avatar: undefined as unknown as string | undefined,
    role: roleName,
  }
}

const UsersApi = {
  apiListUsers,
  apiListAdmins,
  apiGetUserById,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiGetMe,
  isAdminOrSuper,
  userDisplayName,
  normalizeUser,
}

export default UsersApi
