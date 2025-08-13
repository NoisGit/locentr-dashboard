// src/services/RoleService.ts
import ApiService from './ApiService'

export type Role = {
  id: number
  name: string
}

export function apiGetRoles() {
  return ApiService.fetchDataWithAxios<Role[]>({
    url: '/api/v1/roles/',
    method: 'get',
  })
}
