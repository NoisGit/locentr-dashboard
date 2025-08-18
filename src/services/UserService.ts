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
  return (
    u.full_name ||
    u.name ||
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    ''
  )
}

/** 🔹 Devuelve los usuarios paginados desde /api/v1/users */
export async function apiListUsers(params: ListParams = {}): Promise<ListResult> {
  const resp = await ApiService.fetchDataWithAxios<any>({
    url: '/api/v1/users',
    method: 'get',
    params: {
      pageIndex: params.pageIndex ?? 1,
      pageSize: params.pageSize ?? 10,
      query: params.query ?? '',
      ...(params.sort?.key ? { 'sort[key]': params.sort.key } : {}),
      ...(params.sort?.order ? { 'sort[order]': params.sort.order } : {}),
    },
  })

  // Soporta varios formatos de respuesta comunes
  const arr =
    (Array.isArray(resp?.items) && resp.items) ||
    (Array.isArray(resp?.data?.items) && resp.data.items) ||
    (Array.isArray(resp?.list) && resp.list) ||
    (Array.isArray(resp?.data) && resp.data) ||
    (Array.isArray(resp?.results) && resp.results) ||
    (Array.isArray(resp) && resp) ||
    []

  const total =
    Number(
      resp?.total ??
      resp?.count ??
      resp?.pagination?.total ??
      resp?.data?.total ??
      arr.length,
    )

  return { items: arr as UserRow[], total }
}

/** 🔹 Detalle por id */
export function apiGetUserById(id: number | string) {
  return ApiService.fetchDataWithAxios<UserRow>({
    url: `/api/v1/users/${id}`,
    method: 'get',
  })
}

/** 🔹 Crear usuario */
export function apiCreateUser(payload: {
  full_name: string
  phone: string
  email: string
  password: string
  role_id: number
}) {
  return ApiService.fetchDataWithAxios({
    url: '/api/v1/users',
    method: 'post',
    data: payload,
  })
}

/** 🔹 Actualizar usuario */
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
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${id}`,
    method: 'put',
    data: payload,
  })
}

/** 🔹 Eliminar usuario */
export function apiDeleteUser(id: number | string) {
  return ApiService.fetchDataWithAxios({
    url: `/api/v1/users/${id}`,
    method: 'delete',
  })
}

/** 🔹 /me para hidratar el dropdown y el store al loguear */
export async function apiGetMe() {
  return ApiService.fetchDataWithAxios<UserRow>({
    url: '/api/v1/users/me',
    method: 'get',
  })
}

/** 🔹 Normaliza al formato del store (userName, email, avatar?, role?) */
export function normalizeUser(u: UserRow) {
  const roleName =
    (typeof u.role === 'string' ? u.role : u.role?.name) ?? undefined

  return {
    id: u.id,
    userName: userDisplayName(u),
    email: u.email ?? '',
    avatar: undefined as unknown as string | undefined,
    role: roleName,
  }
}
