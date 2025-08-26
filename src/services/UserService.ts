// src/services/UserService.ts
import ApiService from '@/services/ApiService'

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

function pickArr(raw: any) {
  return (
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []
  )
}

export async function apiListUsers(params: ListParams = {}): Promise<ListResult> {
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/users/', // barra final para evitar 301
    method: 'get',
    params: {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 10,
      query: params.query ?? '',
      ...(params.sort?.key ? { 'sort[key]': params.sort.key } : {}),
      ...(params.sort?.order ? { 'sort[order]': params.sort.order } : {}),
    },
  })

  const arr = pickArr(resp)
  const total = Number(
    resp?.total ?? resp?.count ?? resp?.pagination?.total ?? resp?.data?.total ?? arr.length
  )
  return { items: arr as UserRow[], total }
}

export function apiGetUserById(id: number | string) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios<UserRow>({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
}

export function apiCreateUser(payload: {
  full_name: string
  phone: string
  email: string
  password: string
  role_id: number
}) {
  return ApiService.fetchDataWithAxios({
    url: '/api/v1/users/',
    method: 'post',
    data: payload,
  })
}

export function apiUpdateUser(
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
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: payload,
  })
}

export function apiDeleteUser(id: number | string) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}

export async function apiGetMe() {
  return ApiService.fetchDataWithAxios<UserRow>({
    url: '/api/v1/users/me',
    method: 'get',
  })
}

export function normalizeUser(u: UserRow) {
  const roleName = (typeof u.role === 'string' ? u.role : u.role?.name) || undefined
  return {
    id: u.id,
    userName: userDisplayName(u),
    email: u.email ?? '',
    avatar: undefined as unknown as string | undefined,
    role: roleName,
  }
}
