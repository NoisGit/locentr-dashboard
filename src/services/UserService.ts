// src/services/UserService.ts
import ApiService from '@/services/ApiService'

export type RawUser = {
  id?: number | string
  email?: string
  email_address?: string
  full_name?: string
  first_name?: string
  last_name?: string
  name?: string
  avatar?: string
  avatar_url?: string
  photoURL?: string
  photo_url?: string
  role?: { id?: number | string; name?: string } | string
}

export async function apiGetMe() {
  return ApiService.fetchDataWithAxios<RawUser>({
    url: 'v1/users/me',
    method: 'get',
  })
}

// Normaliza a la forma que usa el store/Dropdown
export function adaptToStoreUser(u: RawUser) {
  const name =
    u.full_name ||
    u.name ||
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    ''

  const email = u.email || u.email_address || ''
  const avatar =
    u.avatar || u.avatar_url || u.photoURL || u.photo_url || ''

  const roleName =
    (typeof u.role === 'string' ? u.role : u.role?.name) ?? undefined

  return {
    id: u.id,
    userName: name,   // 👈 clave que lee el header
    email,
    avatar,
    role: roleName,
  }
}

// Alias para mantener compatibilidad con imports antiguos
export const normalizeUser = adaptToStoreUser
