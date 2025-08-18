// src/services/CustomersService.ts
import ApiService from '@/services/ApiService'

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

function adaptUserRow(u: any): CustomerRow {
  const name =
    u?.full_name ??
    u?.name ??
    [u?.first_name, u?.last_name].filter(Boolean).join(' ') ??
    ''
  const email = u?.email ?? u?.email_address ?? ''
  const role =
    (typeof u?.role === 'string' ? u?.role : u?.role?.name) ?? undefined
  const rawId = u?.id ?? u?._id ?? ''
  const cleanId = String(rawId).replace(/\/+$/, '')
  return {
    id: cleanId,
    name,
    email,
    phone: u?.phone ?? u?.phone_number ?? '',
    role,
    avatar: u?.avatar ?? u?.avatar_url ?? u?.photoURL ?? u?.photo_url ?? '',
  }
}

function pickItemsAndTotal(raw: any) {
  const items =
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.users) && raw.users) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.users) && raw.data.users) ||
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

export async function apiGetCustomersList<
  T = GetCustomersListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? 10))
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/users/',
    method: 'get',
    params: {
      pageIndex,
      pageSize,
      query: params.query ?? '',
      ...(params.sort?.key ? { 'sort[key]': params.sort.key } : {}),
      ...(params.sort?.order ? { 'sort[order]': params.sort.order } : {}),
    },
  })
  const { items, total } = pickItemsAndTotal(resp)
  const list: CustomerRow[] = items.map(adaptUserRow)
  return { list, total } as T
}

export async function apiCreateCustomer(payload: {
  full_name: string
  email: string
  phone?: string
  password: string
  role_id: number | string
}) {
  return ApiService.fetchDataWithAxios({
    url: '/api/v1/users',
    method: 'post',
    data: payload,
  })
}

export async function apiGetCustomerById(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'get',
  })
  return resp
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
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'put',
    data: patch,
  })
}

export async function apiDeleteCustomer(id: string | number) {
  const cleanId = String(id).replace(/\/+$/, '')
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${encodeURIComponent(cleanId)}`,
    method: 'delete',
  })
}
