import ApiService from '@/services/ApiService'
import type { AxiosRequestConfig } from 'axios'

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'CLIENT'
export type CreatableUserRole = Exclude<UserRole, 'SUPERADMIN'>

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

export type UserRow = {
  id: number | string
  username?: string
  name: string
  email: string
  role?: UserRole | string
  status?: boolean
  is_active?: boolean
  avatar?: string
  full_name?: string
  first_name?: string
  last_name?: string
  plan_id?: number | null
  company_id?: number | null
}

export type GetUsersListResponse = {
  list: UserRow[]
  total: number
}

export type UserCreateRequest = {
  username: string
  full_name: string
  email: string
  password: string
  role: UserRole | string
  plan_id?: number | null
  status?: boolean
}

export type UserUpdateRequest = Partial<{
  full_name: string
  email: string
  role: UserRole | string
  status: boolean
}>

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ReqConfig = {
  url: string
  method: HttpMethod
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
}

type UserLike = {
  id?: number | string
  _id?: number | string
  user_id?: number | string
  uid?: number | string
  username?: string
  first_name?: string
  last_name?: string
  full_name?: string
  name?: string
  email?: string
  role?: UserRole | string
  status?: boolean
  is_active?: boolean
  plan_id?: number | null
  company_id?: number | null
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
  return String(user.full_name || user.name || nameParts || user.username || '')
}

function adaptUserRow(user: UserLike): UserRow {
  const name = userDisplayName(user)
  const email = String(user.email || '')
  const rawId = user.id ?? user._id ?? user.user_id ?? user.uid ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')

  return {
    id: cleanId,
    username: user.username,
    name,
    full_name: user.full_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email,
    role: user.role,
    status: user.status,
    is_active: user.is_active,
    plan_id: user.plan_id,
    company_id: user.company_id,
    avatar: user.avatar ?? user.avatar_url ?? user.photoURL ?? user.photo_url ?? '',
  }
}

export function normalizeUser(user: unknown) {
  const row = isRecord(user) ? adaptUserRow(user as UserLike) : adaptUserRow({})

  return {
    id: row.id,
    userName: row.name,
    full_name: row.full_name || row.name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    company_id: row.company_id,
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

  if (params.pageIndex != null) queryParams.page = params.pageIndex
  if (params.pageSize != null) queryParams.size = params.pageSize
  if (params.query != null) queryParams.search = params.query
  if (params.sort?.key) queryParams.sort_by = params.sort.key
  if (params.sort?.order) queryParams.sort_order = params.sort.order

  const data = await req<unknown>({ url: BASE_COLLECTION, method: 'get', params: queryParams })
  const { items, total } = extractListPayload(data)
  const list: UserRow[] = (items as UserLike[]).map(adaptUserRow)

  return { list, total } as T
}

export async function apiCreateUser(payload: UserCreateRequest) {
  if (payload.role === 'SUPERADMIN') {
    throw new Error('SUPERADMIN no puede crearse desde el panel.')
  }
  return req<UserRow>({ url: BASE_COLLECTION, method: 'post', data: payload })
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
        params: { page: 1, size: 50, search: String(cleanId) },
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

export async function apiUpdateUser(id: string | number, patch: UserUpdateRequest) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`

  return req<UserRow>({ url, method: 'put', data: patch })
}

export async function apiDeleteUser(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`

  return req<unknown>({ url, method: 'delete' })
}
