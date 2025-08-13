import ApiService from './ApiService'

const USERS_PATH = '/api/v1/users/' // <- slash final para evitar redirect 301

export async function apiGetCustomersList<T, U extends Record<string, unknown>>(params: U) {
  return ApiService.fetchDataWithAxios<T>({
    url: USERS_PATH,
    method: 'get',
    params,
  })
}

export async function apiGetCustomer<T, U extends Record<string, unknown>>({
  id,
  ...params
}: U & { id: string | number }) {
  return ApiService.fetchDataWithAxios<T>({
    url: `${USERS_PATH}${id}`,
    method: 'get',
    params,
  })
}

// No existe "log" real; usamos /me para no romper importadores que lo llamen
export async function apiGetCustomerLog<T>() {
  return ApiService.fetchDataWithAxios<T>({
    url: `${USERS_PATH}me`,
    method: 'get',
  })
}

export type CreateUserPayload = {
  email: string
  password: string
  name?: string
  phone?: string
  role: 'superadmin' | 'admin' | 'guard' | 'porter' | 'resident' | string
  status?: 'active' | 'inactive' | string
}

export async function apiCreateCustomer<T>(payload: CreateUserPayload) {
  return ApiService.fetchDataWithAxios<T>({
    url: USERS_PATH,
    method: 'post',
    data: payload,
  })
}
