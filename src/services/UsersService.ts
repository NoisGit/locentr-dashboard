import ApiService from '@/services/ApiService'
import type { AxiosRequestConfig } from 'axios'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

export type RoleRef = {
  id?: number | string
  name?: string
}

export type UserRow = {
  id: number | string
  name: string
  email: string
  phone?: string
  role?: string | RoleRef
  role_id?: number | string
  avatar?: string
  full_name?: string
  first_name?: string
  last_name?: string
}

export type GetUsersListResponse = {
  list: UserRow[]
  total: number
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ReqConfig = {
  url: string
  method: HttpMethod
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
}

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
  role_id?: number | string
  role_name?: string
  avatar?: string
  avatar_url?: string
  photoURL?: string
  photo_url?: string
}

type Dict = Record<string, unknown>

function isRecord(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null
}

function extractListPayload(d: unknown): { items: unknown[]; total: number } {
  let items: unknown[] = []
  let total = 0

  if (isRecord(d)) {
    if (Array.isArray(d.items)) items = d.items
    else if (isRecord(d.data) && Array.isArray(d.data.items)) items = d.data.items
    else if (Array.isArray(d.list)) items = d.list
    else if (Array.isArray(d.data)) items = d.data
    else if (Array.isArray(d.results)) items = d.results

    const cand =
      d.total ??
      d.count ??
      (isRecord(d.pagination) ? d.pagination.total : undefined) ??
      (isRecord(d.data) ? d.data.total : undefined) ??
      (isRecord(d.data) ? d.data.count : undefined)

    total = Number(typeof cand === 'number' || typeof cand === 'string' ? cand : items.length)
  } else if (Array.isArray(d)) {
    items = d
    total = items.length
  }

  return { items, total }
}

function userDisplayName(user: UserLike) {
  const nameParts = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return String(user.full_name || user.name || nameParts || '')
}

function adaptUserRow(user: UserLike): UserRow {
  const name = userDisplayName(user)
  const email = String(user.email || '')
  const role =
    (typeof user.role === 'string' ? user.role : user.role?.name) ||
    user.role_name ||
    undefined
  const rawId = user.id ?? user._id ?? user.user_id ?? user.uid ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')

  return {
    id: cleanId,
    name,
    full_name: user.full_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email,
    phone: user.phone ?? user.phone_number ?? '',
    role,
    role_id: user.role_id ?? (typeof user.role === 'object' ? user.role?.id : undefined),
    avatar: user.avatar ?? user.avatar_url ?? user.photoURL ?? user.photo_url ?? '',
  }
}

export function normalizeUser(user: unknown) {
  const row = isRecord(user) ? adaptUserRow(user as UserLike) : adaptUserRow({})
  const roleName = typeof row.role === 'string' ? row.role : row.role?.name
  const roleId = row.role_id || (typeof row.role === 'object' ? row.role?.id : undefined)

  return {
    id: row.id,
    userName: row.name,
    email: row.email,
    avatar: row.avatar,
    role: roleName,
    role_id: roleId,
  }
}

const BASE_COLLECTION = '/api/v1/users/'
const BASE_ITEM = '/api/v1/users'

async function req<T>(cfg: ReqConfig): Promise<T> {
  return ApiService.fetchDataWithAxios<T, Record<string, unknown>>(
    cfg as unknown as AxiosRequestConfig<Record<string, unknown>>,
  )
}

export async function apiGetUsersList<
  T = GetUsersListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const queryParams: Record<string, unknown> = {}

  if (params.pageIndex != null) queryParams.pageIndex = params.pageIndex
  if (params.pageSize != null) queryParams.pageSize = params.pageSize
  if (params.query != null) queryParams.query = params.query
  if (params.sort?.key) queryParams['sort[key]'] = params.sort.key
  if (params.sort?.order) queryParams['sort[order]'] = params.sort.order

  const data = await req<unknown>({ url: BASE_COLLECTION, method: 'get', params: queryParams })
  const { items, total } = extractListPayload(data)
  const list: UserRow[] = (items as UserLike[]).map(adaptUserRow)

  return { list, total } as T
}

export async function apiCreateUser(payload: {
  full_name: string
  email: string
  phone?: string
  password: string
  role_id: number | string
}) {
  return req<unknown>({ url: BASE_COLLECTION, method: 'post', data: payload })
}

export async function apiGetUserById(id: string | number) {
  const cleanId = String(id).trim().replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`

  try {
    return await req<unknown>({ url, method: 'get' })
  } catch (error) {
    try {
      return await req<unknown>({ url: `${url}/`, method: 'get' })
    } catch {
      const data = await req<unknown>({
        url: BASE_COLLECTION,
        method: 'get',
        params: { pageIndex: 1, pageSize: 50, query: String(cleanId) },
      })
      const { items } = extractListPayload(data)
      const found =
        (items as UserLike[]).find((item) => String(item.id ?? item._id) === cleanId) ??
        (items as UserLike[]).find((item) => String(item.user_id ?? item.uid) === cleanId) ??
        null

      if (!found) throw error
      return found
    }
  }
}

export async function apiUpdateUser(
  id: string | number,
  patch: Partial<{
    full_name: string
    email: string
    phone: string
    password: string
    role_id: number | string
  }>,
) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`

  return req<unknown>({ url, method: 'put', data: patch })
}

export async function apiDeleteUser(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`

  return req<unknown>({ url, method: 'delete' })
}
