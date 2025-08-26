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

function pickItemsAndTotal(raw: any) {
  const items =
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.list) && raw.list) ||
    (Array.isArray(raw?.users) && raw.users) ||
    (Array.isArray(raw?.data?.items) && raw.data.items) ||
    (Array.isArray(raw?.data?.list) && raw.data.list) ||
    (Array.isArray(raw?.data?.users) && raw.data.users) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.results) && raw.results) ||
    (Array.isArray(raw) && raw) ||
    []

  const total = Number(
    raw?.total ?? raw?.count ?? raw?.data?.total ?? raw?.pagination?.total ?? items.length
  )
  return { items, total }
}

function adaptUserRow(u: any): CustomerRow {
  const nameParts = [u?.first_name, u?.last_name].filter(Boolean).join(' ')
  const name = String(u?.full_name || u?.name || nameParts || '')
  const email = String(u?.email || u?.email_address || '')
  const role =
    (typeof u?.role === 'string' ? u?.role : u?.role?.name) || u?.role_name || undefined
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

async function fetchRolesMap() {
  try {
    const resp = await ApiService.fetchDataWithAxios<any>({
      url: '/api/v1/roles/', // barra final para evitar 301
      method: 'get',
    })
    const roles =
      (Array.isArray(resp?.items) && resp.items) ||
      (Array.isArray(resp?.list) && resp.list) ||
      (Array.isArray(resp?.data?.items) && resp.data.items) ||
      (Array.isArray(resp?.data) && resp.data) ||
      (Array.isArray(resp?.results) && resp.results) ||
      (Array.isArray(resp) && resp) ||
      []
    const map = new Map<string, string>()
    roles.forEach((r: any) => {
      const id = String(r?.id ?? r?._id ?? '')
      const name = String(r?.name ?? r?.role_name ?? '')
      if (id) map.set(id, name)
    })
    return map
  } catch {
    return new Map<string, string>()
  }
}

export async function apiGetCustomersList<
  T = GetCustomersListResponse,
  Q extends TableQueries = TableQueries
>(params: Q): Promise<T> {
  const pageIndex = Math.max(1, Number(params.pageIndex ?? 1))
  const pageSize = Math.max(1, Number(params.pageSize ?? 10))

  const [usersResp, rolesMap] = await Promise.all([
    ApiService.fetchDataWithAxios<any>({
      url: '/api/v1/users/', // barra final
      method: 'get',
      params: {
        pageIndex,
        pageSize,
        query: params.query ?? '',
        ...(params.sort?.key ? { 'sort[key]': params.sort.key } : {}),
        ...(params.sort?.order ? { 'sort[order]': params.sort.order } : {}),
      },
    }),
    fetchRolesMap(),
  ])

  const { items, total } = pickItemsAndTotal(usersResp)

  const list: CustomerRow[] = (items as any[]).map((u) => {
    const row = adaptUserRow(u)
    if (!row.role) {
      const rid = String(u?.role_id ?? u?.roleId ?? u?.role?.id ?? '')
      const roleName = rid ? rolesMap.get(rid) : undefined
      if (roleName) row.role = roleName
    }
    return row
  })

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
    url: '/api/v1/users/',
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
