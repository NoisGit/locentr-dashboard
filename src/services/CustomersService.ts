// src/services/CustomersService.ts
import ApiService from '@/services/ApiService'
import type { AxiosRequestConfig } from 'axios'

export type TableQueries = {
  pageIndex: number
  pageSize: number
  query?: string
  sort?: { key?: string; order?: 'asc' | 'desc' }
}

export type CustomerRow = {
  id: number | string
  name: string
  email: string
  phone?: string
  role?: string
  avatar?: string
}

export type GetCustomersListResponse = {
  list: CustomerRow[]
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

function adaptUserRow(u: UserLike): CustomerRow {
  const nameParts = [u.first_name, u.last_name].filter(Boolean).join(' ')
  const name = String(u.full_name || u.name || nameParts || '')
  const email = String(u.email || '')
  const role =
    (typeof u.role === 'string' ? u.role : u.role?.name) ||
    u.role_name ||
    undefined
  const rawId = u.id ?? u._id ?? u.user_id ?? u.uid ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')
  return {
    id: cleanId,
    name,
    email,
    phone: u.phone ?? u.phone_number ?? '',
    role,
    avatar: u.avatar ?? u.avatar_url ?? u.photoURL ?? u.photo_url ?? '',
  }
}

const BASE_COLLECTION = '/api/v1/users/'
const BASE_ITEM = '/api/v1/users'

async function req<T>(cfg: ReqConfig): Promise<T> {
  const resp = await ApiService.fetchDataWithAxios<T, Record<string, unknown>>(
    cfg as unknown as AxiosRequestConfig<Record<string, unknown>>,
  )
  return resp
}

export async function apiGetCustomersList<
  T = GetCustomersListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const queryParams: Record<string, unknown> = {}
  if (params.pageIndex != null) queryParams.pageIndex = params.pageIndex
  if (params.pageSize != null) queryParams.pageSize = params.pageSize
  if (params.query != null) queryParams.query = params.query
  if (params.sort?.key) queryParams['sort[key]'] = params.sort.key
  if (params.sort?.order) queryParams['sort[order]'] = params.sort.order
  const d = await req<unknown>({ url: BASE_COLLECTION, method: 'get', params: queryParams })
  const { items, total } = extractListPayload(d)
  const list: CustomerRow[] = (items as UserLike[]).map(adaptUserRow)
  return { list, total } as T
}

export async function apiCreateCustomer(payload: {
  full_name: string
  email: string
  phone?: string
  password: string
  role_id: number | string
}) {
  const d = await req<unknown>({ url: BASE_COLLECTION, method: 'post', data: payload })
  return d
}

export async function apiGetCustomerById(id: string | number) {
  const cleanId = String(id).trim().replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`
  try {
    const d = await req<unknown>({ url, method: 'get' })
    return d
  } catch (e) {
    try {
      const d2 = await req<unknown>({ url: `${url}/`, method: 'get' })
      return d2
    } catch {
      const d3 = await req<unknown>({
        url: BASE_COLLECTION,
        method: 'get',
        params: { pageIndex: 1, pageSize: 50, query: String(cleanId) },
      })
      const { items } = extractListPayload(d3)
      const found =
        (items as UserLike[]).find((u) => String(u.id ?? u._id) === cleanId) ??
        (items as UserLike[]).find((u) => String(u.user_id ?? u.uid) === cleanId) ??
        null
      if (!found) throw e
      return found
    }
  }
}

export async function apiUpdateCustomer(
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
  const d = await req<unknown>({ url, method: 'put', data: patch })
  return d
}

export async function apiDeleteCustomer(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const url = `${BASE_ITEM}/${encodeURIComponent(cleanId)}`
  const d = await req<unknown>({ url, method: 'delete' })
  return d
}
